import 'core-js/full/reflect';

import process from 'node:process';

import { RequestContext } from '@mikro-orm/core';
import { spawn } from 'bun';
import chalk from 'chalk';
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
import env, { validateEnv } from '@/env';
import {
	ExtractLocale,
	Maintenance,
	NotBot,
	RequestContextIsolator,
} from '@/guards';
import {
	Database,
	ErrorHandler,
	ImagesUpload,
	Logger,
	PluginsManager,
	Store,
} from '@/services';
import { keptInstances } from '@/utils/decorators';
import { initDataTable, resolveDependency } from '@/utils/functions';

declare global {
	// eslint-disable-next-line no-var
	var client: Client;
}

console.log('1');

/**
 * Hot reload
 */
async function reload(client: Client) {
	const store = await resolveDependency(Store);
	store.set('botHasBeenReloaded', true);

	const logger = await resolveDependency(Logger);
	console.log('\n');
	logger.startSpinner('Hot reloading...');

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

	// rebuild
	await MetadataStorage.instance.build();
	await client.initApplicationCommands();
	client.initEvents();

	// re-init services

	const pluginManager = await resolveDependency(PluginsManager);
	await pluginManager.loadPlugins();

	const db = await resolveDependency(Database);
	await db.initialize();

	await logger.log(chalk.whiteBright('Hot reloaded\n'));
}

async function init() {
	const logger = await resolveDependency(Logger);

	validateEnv();

	// init error handler
	await resolveDependency(ErrorHandler);

	// init plugins
	const pluginManager = await resolveDependency(PluginsManager);
	await pluginManager.loadPlugins();
	await pluginManager.syncTranslations();

	// strart spinner
	console.log('\n');
	logger.startSpinner('Starting...');

	// init the database
	const db = await resolveDependency(Database);
	await db.initialize();

	// init the client
	DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);
	globalThis.client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.MessageContent,
		],

		partials: [Partials.Channel, Partials.Message, Partials.Reaction],

		guards: [RequestContextIsolator, NotBot, Maintenance, ExtractLocale],

		simpleCommand: {
			prefix: generalConfig.simpleCommandsPrefix,
		},

		silent: !env.isDev,
		...(env.isDev &&
			generalConfig.testGuildId && {
				botGuilds: [generalConfig.testGuildId as string],
			}),
	});

	// Load all new events
	await discordLogs(client, { debug: !env.isDev });
	container.registerInstance(Client, client);

	// import all the commands and events
	await pluginManager.importCommands();
	await pluginManager.importEvents();

	await RequestContext.create(db.orm.em, async () => {
		// init the data table if it doesn't exist
		await initDataTable();

		// init plugins services
		pluginManager.initServices();

		// init the plugin main file
		await pluginManager.execMains();

		// log in with the bot token
		client
			.login(env.BOT_TOKEN)
			.then(async () => {
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

				const store = container.resolve(Store);
				store.select('ready').subscribe((state) => {
					// check that all properties that are not null are set to true
					if (
						Object.values(state)
							.filter((value) => value !== null)
							.every((value) => value)
					) {
						throw new Error('Bot services are not ready when they should be');
					}
				});
			})
			.catch((err: unknown) => {
				console.error(err);
				process.exit(1);
			});
	});
}

if (env.isDev) {
	spawn(['bun', '-c', 'run', 'i18n:watch'], { stdout: 'inherit' });
}

if (!(await resolveDependency(Store)).get('botHasBeenReloaded')) {
	console.log('Not reloading');
	await init();
} else {
	console.log('Reloading');
	await reload(globalThis.client);
}
