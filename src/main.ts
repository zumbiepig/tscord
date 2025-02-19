import 'reflect-metadata';

import { join } from 'node:path';

import { NotBot } from '@discordx/utilities';
import { RequestContext } from '@mikro-orm/core';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { GatewayIntentBits, Partials } from 'discord.js';
import discordLogs from 'discord-logs';
import {
	Client,
	DIService,
	MetadataStorage,
	tsyringeDependencyRegistryEngine,
} from 'discordx';
import { container } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';

import { Server } from '@/api/server';
import { apiConfig, generalConfig } from '@/configs';
import { env, validateEnv } from '@/env';
import { ExtractLocale, Maintenance, RequestContextIsolator } from '@/guards';
import {
	Database,
	ErrorHandler,
	EventManager,
	ImagesUpload,
	Logger,
	PluginsManager,
	Store,
} from '@/services';
import { keptInstances } from '@/utils/decorators';
import { initDataTable, resolveDependency } from '@/utils/functions';

/** 0: Not reloading, 1: Reloading, 2: Reload requested */
let reloadingState = 0;

async function init() {
	// validate env values
	validateEnv();

	// init error handler
	await resolveDependency(ErrorHandler);

	// init plugins
	const pluginsManager = await resolveDependency(PluginsManager);
	await pluginsManager.loadPlugins();
	await pluginsManager.syncTranslations();

	// start spinner
	const logger = await resolveDependency(Logger);
	await logger.startSpinner('Starting...');

	// init the database
	const db = await resolveDependency(Database);
	await db.init();

	// init the client
	DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildModeration,
			GatewayIntentBits.GuildExpressions,
			GatewayIntentBits.GuildIntegrations,
			GatewayIntentBits.GuildWebhooks,
			GatewayIntentBits.GuildInvites,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildMessageTyping,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.DirectMessageReactions,
			GatewayIntentBits.DirectMessageTyping,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildScheduledEvents,
			GatewayIntentBits.AutoModerationConfiguration,
			GatewayIntentBits.AutoModerationExecution,
			GatewayIntentBits.GuildMessagePolls,
			GatewayIntentBits.DirectMessagePolls,
		],

		partials: [
			Partials.User,
			Partials.Channel,
			Partials.GuildMember,
			Partials.Message,
			Partials.Reaction,
			Partials.GuildScheduledEvent,
			Partials.ThreadMember,
		],

		guards: [RequestContextIsolator, NotBot, ExtractLocale, Maintenance],

		...(generalConfig.simpleCommandsPrefix !== null && {
			simpleCommand: {
				prefix: generalConfig.simpleCommandsPrefix,
			},
		}),

		silent: !env.isDev,

		...(env.isDev &&
			generalConfig.testGuildId && {
				botGuilds: [generalConfig.testGuildId],
			}),
	});

	// Load all new events
	// @ts-expect-error: discord.js/discordx type overlap
	await discordLogs(client, { debug: !env.isDev });
	container.registerInstance(Client, client);

	// import all the commands and events
	await pluginsManager.importCommands();
	await pluginsManager.importEvents();

	await RequestContext.create(db.em, async () => {
		// init the data table if it doesn't exist
		await initDataTable();

		// init plugins services
		pluginsManager.initServices();

		// init the plugin main file
		await pluginsManager.execMains();

		// log in with the bot token
		await client.login(env.BOT_TOKEN);

		if (env.isDev) {
			const watcher = chokidar.watch([
				join(import.meta.dirname, 'commands'),
				join(import.meta.dirname, 'events'),
			]);

			// reload commands and events when a file is updated
			watcher.on('all', () => void reload(client));
		}

		// start the api server
		if (apiConfig.enabled) {
			const server = await resolveDependency(Server);
			await server.start();
		}

		// upload images to imgur if configured
		if (generalConfig.automaticUploadImagesToImgur) {
			const imagesUpload = await resolveDependency(ImagesUpload);
			await imagesUpload.syncWithDatabase();
		}

		const eventManager = await resolveDependency(EventManager);
		const store = container.resolve(Store);
		// subscribe to all changes to the 'ready' state
		store.select('ready').subscribe((state) => {
			// check that all properties that not disabled are ready
			if (
				Object.values(state)
					.filter((value) => value !== null)
					.every((value) => value)
			) {
				void eventManager.emit('fullyReady'); // the template is fully ready!
			}
		});
	});
}

/**
 * Hot reload
 */
async function reload(client: Client, force = false) {
	// if currently reloading, request new reload
	if (!force && reloadingState > 0) {
		reloadingState = 2;
		return;
	}
	reloadingState = 1;

	const store = await resolveDependency(Store);
	store.set('botHasBeenReloaded', true);

	const logger = await resolveDependency(Logger);
	await logger.startSpinner('Hot reloading...');

	// remove events
	client.removeEvents();

	// get all instances to keep
	const instancesToKeep = new Map<constructor<unknown>, unknown>();
	for (const target of keptInstances) {
		const instance = await resolveDependency(target);
		instancesToKeep.set(target, instance);
	}

	// cleanup
	MetadataStorage.clear();
	DIService.engine.clearAllServices();

	// transfer store instance to the new container in order to keep the same states
	for (const [target, instance] of instancesToKeep) {
		container.registerInstance(target, instance);
	}

	// re-register the client instance
	container.registerInstance(Client, client);

	// reload files (this does not work in esm)
	/* await Promise.all(
		(
			await glob(
				join(import.meta.dirname, '{commands,events}', '**', '*.{js,ts}'),
				{ windowsPathsNoEscape: true },
			)
		).map(async (file) => {
			const module = require.resolve(file);
			delete require.cache[module];
			await import(module);
		}),
	); */

	// rebuild
	await MetadataStorage.instance.build();
	await client.initApplicationCommands();
	client.initEvents();

	// re-init services
	const pluginsManager = await resolveDependency(PluginsManager);
	await pluginsManager.loadPlugins();

	const db = await resolveDependency(Database);
	await db.init();

	await logger.log('info', 'Hot reloaded!', chalk.whiteBright('Hot reloaded!'));

	// if another reload was requested, reload again
	if (reloadingState === 2) await reload(client, true);
	reloadingState = 0;
}

await init();
