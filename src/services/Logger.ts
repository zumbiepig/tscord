import { createReadStream, createWriteStream } from 'node:fs';
import { appendFile, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';

import archiver from 'archiver';
import boxen from 'boxen';
import chalk from 'chalk';
import {
	AttachmentBuilder,
	type BaseMessageOptions,
	type Interaction,
	type Snowflake,
	TextChannel,
	ThreadChannel,
	User,
} from 'discord.js';
import { Client, MetadataStorage, SimpleCommandMessage } from 'discordx';
import ora from 'ora';
import { delay, inject } from 'tsyringe';

import * as controllers from '@/api/controllers';
import { apiConfig, colorsConfig, logsConfig } from '@/configs';
import { locales } from '@/i18n';
import { PluginsManager, Scheduler } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	dayjsTimezone,
	formatDate,
	getTypeOfInteraction,
	numberAlign,
	resolveAction,
	resolveChannel,
	resolveGuild,
	resolveUser,
	timeAgo,
} from '@/utils/functions';

@Service()
export class Logger {
	private readonly logPath: string = join('logs');
	private readonly logArchivePath: string = join(this.logPath, 'archives');

	private readonly levels = ['debug', 'info', 'warn', 'error'] as const;
	private embedLevelBuilder = {
		debug: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'DEBUG',
					description: message,
					color: colorsConfig.logDebug,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		info: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'INFO',
					description: message,
					color: colorsConfig.logInfo,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		warn: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'WARN',
					description: message,
					color: colorsConfig.logWarn,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		error: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'ERROR',
					description: message,
					color: colorsConfig.logError,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
	};

	private spinner = ora();

	private _lastLogsTail: string[] = [];

	constructor(
		@inject(delay(() => Client)) private client: Client,
		@inject(delay(() => Scheduler)) private scheduler: Scheduler,
		@inject(delay(() => PluginsManager))
		private pluginsManager: PluginsManager,
	) {}

	/**
	 * Helper function that will log in the console, and optionally in a file or discord channel depending on params.
	 * @param level debug | info | warn | error
	 * @param message message to log
	 * @param chalkedMessage chalked version of message to log to console
	 * @param logLocation where to log the message
	 */
	async log(
		level: (typeof this.levels)[number],
		message: string,
		chalkedMessage: string | null = null,
		logLocation: {
			console?: boolean;
			file?: boolean;
			channelId?: Snowflake | null;
			discordEmbed?: BaseMessageOptions;
		} = {},
	): Promise<void> {
		const date = dayjsTimezone();
		const formattedDate = formatDate(date, 'onlyDateFilename');
		const formattedTime = formatDate(date, 'logs');
		const formattedLevel = level.toUpperCase();
		const trimmedMessage = message.trim();
		const logMessage = `[${formattedTime}] [${formattedLevel}] ${trimmedMessage}`;
		const chalkedLogMessage = `[${chalk.dim(formattedTime)}] [${formattedLevel}] ${chalkedMessage?.trim() ?? trimmedMessage}`;

		// set default values
		logLocation.console = logLocation.console ?? logsConfig.system.console;
		logLocation.file = logLocation.file ?? logsConfig.system.file;
		logLocation.channelId =
			logLocation.channelId !== undefined
				? logLocation.channelId
				: logsConfig.system.channelId;
		logLocation.discordEmbed =
			logLocation.discordEmbed ?? this.embedLevelBuilder[level](logMessage);

		// log to console
		if (logLocation.console) {
			switch (level) {
				case 'debug':
					console.debug(chalk.grey(chalkedLogMessage));
					break;
				case 'info':
					console.info(chalk.cyan(chalkedLogMessage));
					break;
				case 'warn':
					console.warn(chalk.yellow(chalkedLogMessage));
					break;
				case 'error':
					console.error(chalk.red(chalkedLogMessage));
					break;
			}
		}

		// save log to file
		if (logLocation.file) {
			await mkdir(this.logPath, { recursive: true });
			await appendFile(
				join(this.logPath, `${formattedDate}.log`),
				logMessage + '\n',
			);
		}

		// send to discord channel
		if (logLocation.channelId) {
			while (!this.client.token) await setTimeout(50);

			const channel = await this.client.channels
				.fetch(logLocation.channelId)
				.catch(() => null);
			if (channel && 'send' in channel)
				await channel.send(logLocation.discordEmbed);
		}

		// save the last logs tail queue
		this._lastLogsTail.push(message);
		while (this._lastLogsTail.length > logsConfig.logTailMaxSize)
			this._lastLogsTail.shift();
	}

	/**
	 * Logs errors.
	 * @param error
	 * @param type uncaughtException | unhandledRejection
	 * @param trace
	 */
	async logError(
		type: 'uncaughtException' | 'unhandledRejection',
		error: Error,
	): Promise<void> {
		const message = `(ERROR) ${error.stack ?? error.message}`;
		const chalkedMessage = `(${chalk.bold.white('ERROR')}) ${chalk.dim.italic(error.stack ?? error.message)}`;

		const embedTitle = `**${
			type === 'uncaughtException'
				? 'Uncaught Exception: '
				: 'Unhandled Rejection: '
		}**${error.message}`;
		let embedMessage = '```\n' + (error.stack ?? error.message) + '\n```';
		const embedAttachments = [];

		if (embedMessage.length > 4096) {
			embedMessage =
				'```\n' +
				(error.message.length > 4091
					? `${error.message.slice(0, 4088)}...`
					: error.message) +
				'\n```';
			embedAttachments.push(
				new AttachmentBuilder(Buffer.from(error.stack ?? error.message)),
			);
		}

		await this.log('error', message, chalkedMessage, {
			...logsConfig.error,
			discordEmbed: {
				embeds: [
					{
						title:
							embedTitle.length > 256
								? `${embedTitle.slice(0, 253)}...`
								: embedTitle,
						description: embedMessage,
						color: colorsConfig.logError,
						timestamp: dayjsTimezone().toISOString(),
					},
				],
				files: embedAttachments,
			},
		});
	}

	/**
	 * Logs all interactions.
	 * @param interaction
	 */
	async logInteraction(
		interaction: Interaction | SimpleCommandMessage,
	): Promise<void> {
		const type = getTypeOfInteraction(interaction);

		const action = resolveAction(interaction);
		const channel = resolveChannel(interaction);
		const guild = resolveGuild(interaction);
		const user = resolveUser(interaction);

		const message = `(${type}) "${action}" ${channel instanceof TextChannel || channel instanceof ThreadChannel ? `in channel #${channel.name}` : ''} ${guild ? `in guild ${guild.name}` : ''} by ${user.username}#${user.discriminator}`;
		const chalkedMessage = `(${chalk.bold.white(type)}) "${chalk.bold.green(action)}" ${channel instanceof TextChannel || channel instanceof ThreadChannel ? `${chalk.dim.italic.grey('in channel')} ${chalk.bold.blue(`#${channel.name}`)}` : ''} ${guild ? `${chalk.dim.italic.grey('in guild')} ${chalk.bold.blue(guild.name)}` : ''} ${chalk.dim.italic.grey('by')} ${chalk.bold.blue(`${user.username}#${user.discriminator}`)}`;

		await this.log('info', message, chalkedMessage, {
			...logsConfig.interaction,
			discordEmbed: {
				embeds: [
					{
						author: {
							name: `${user.username}#${user.discriminator}`,
							icon_url: user.avatar
								? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
								: '',
						},
						title: `Interaction`,
						thumbnail: { url: guild?.iconURL({ forceStatic: true }) ?? '' },
						fields: [
							{ name: 'Type', value: type, inline: true },
							{ name: '\u200B', value: '\u200B', inline: true },
							{ name: 'Action', value: action, inline: true },
							{ name: 'Guild', value: guild?.name ?? 'Unknown', inline: true },
							{ name: '\u200B', value: '\u200B', inline: true },
							{
								name: 'Channel',
								value:
									channel instanceof TextChannel ||
									channel instanceof ThreadChannel
										? `#${channel.name}`
										: 'Unknown',
								inline: true,
							},
						],
						color: colorsConfig.logInteraction,
						timestamp: dayjsTimezone().toISOString(),
					},
				],
			},
		});
	}

	/**
	 * Logs all new users.
	 * @param user
	 */
	async logNewUser(user: User): Promise<void> {
		const message = `(NEW_USER) ${user.tag} (${user.id}) has been added to the db`;
		const chalkedMessage = `(${chalk.bold.white('NEW_USER')}) ${chalk.bold.green(user.tag)} (${chalk.bold.blue(user.id)}) ${chalk.dim.italic.grey('has been added to the db')}`;

		await this.log('info', message, chalkedMessage, {
			...logsConfig.newUser,
			discordEmbed: {
				embeds: [
					{
						title: 'New user',
						description: `**${user.tag}**`,
						thumbnail: { url: user.displayAvatarURL({ forceStatic: false }) },
						color: colorsConfig.logNewUser,
						timestamp: dayjsTimezone().toISOString(),
						footer: { text: user.id },
					},
				],
			},
		});
	}

	/**
	 * Logs all 'actions' (create, delete, etc) of a guild.
	 * @param guildId
	 * @param type NEW_GUILD | DELETE_GUILD | RECOVER_GUILD
	 */
	async logGuild(
		type: 'NEW_GUILD' | 'DELETE_GUILD' | 'RECOVER_GUILD',
		guildId: Snowflake,
	): Promise<void> {
		const guild = await this.client.guilds
			.fetch(guildId)
			.catch(() => this.client.guilds.cache.get(guildId) ?? null);
		const additionalMessage =
			type === 'NEW_GUILD'
				? 'has been added to the db'
				: type === 'DELETE_GUILD'
					? 'has been deleted'
					: 'has been recovered';
		const message = `(${type}) Guild ${guild ? `${guild.name} (${guildId})` : guildId} ${additionalMessage}`;
		const chalkedMessage = `(${chalk.bold.white(type)}) ${chalk.dim.italic.grey('Guild')} ${guild ? `${chalk.bold.green(guild.name)} (${chalk.bold.blue(guildId)})` : guildId} ${chalk.dim.italic.grey(additionalMessage)}`;

		await this.log('info', message, chalkedMessage, {
			...logsConfig.guild,
			discordEmbed: {
				embeds: [
					{
						title:
							type === 'NEW_GUILD'
								? 'New guild'
								: type === 'DELETE_GUILD'
									? 'Deleted guild'
									: 'Recovered guild',
						fields: [
							{
								name: guild?.name ?? 'Unknown',
								value: `${guild?.memberCount.toString() ?? 'N/A'} members`,
							},
						],
						footer: { text: guildId },
						thumbnail: { url: guild?.iconURL() ?? '' },
						color:
							type === 'NEW_GUILD'
								? colorsConfig.logGuildNew
								: type === 'DELETE_GUILD'
									? colorsConfig.logGuildDelete
									: colorsConfig.logGuildRecover,
						timestamp: dayjsTimezone().toISOString(),
					},
				],
			},
		});
	}

	get lastLogsTail(): string[] {
		return this._lastLogsTail;
	}

	/**
	 * Archive the logs in a tar.gz file each day, and delete log archives older than the retention period.
	 */
	@Schedule('0 0 * * *')
	async archiveLogs(): Promise<void> {
		if (!logsConfig.archive.enabled) return;

		await mkdir(this.logArchivePath, { recursive: true });

		const archive = archiver.create('tar', {
			gzip: true,
			gzipOptions: { level: 9 },
		});

		archive.pipe(
			createWriteStream(
				join(
					this.logArchivePath,
					`logs-${formatDate(dayjsTimezone().subtract(1, 'day'), 'onlyDateFilename')}.tar.gz`,
				),
			),
		);

		// add files to the archive
		const logPaths = [];
		for (const currentLogPath of (await readdir(this.logPath)).filter((file) =>
			file.endsWith('.log'),
		)) {
			const path = join(this.logPath, currentLogPath);
			archive.append(createReadStream(path), { name: currentLogPath });
			logPaths.push(path);
		}

		// create archive
		await archive.finalize();

		// delete archived logs
		await Promise.all(logPaths.map((path) => rm(path)));

		// retention policy
		for (const file of await readdir(this.logArchivePath)) {
			const match = /^logs-(.+)\.tar\.gz$/.exec(file);
			if (match?.[1]) {
				if (timeAgo(match[1], 'day') > logsConfig.archive.retentionDays) {
					await this.log(
						'info',
						`Deleting log archive ${file} older than ${logsConfig.archive.retentionDays.toString()} days`,
						`Deleting log archive ${chalk.bold.red(file)} older than ${chalk.bold.red(logsConfig.archive.retentionDays.toString())} days`,
					);
					await rm(join(this.logArchivePath, file));
				}
			}
		}
	}

	async startSpinner(text: string): Promise<void> {
		console.log('\n');
		this.spinner.start(text);
		await this.log('info', text, null, { console: false });
	}

	async logStartingConsole(): Promise<void> {
		this.spinner.stop();

		await this.log(
			'info',
			'━━━━━━━━━━ Started! ━━━━━━━━━━',
			chalk.green('\n━━━━━━━━━━ Started! ━━━━━━━━━━\n'),
		);

		// commands
		const slashCommands = MetadataStorage.instance.applicationCommandSlashes;
		const simpleCommands = MetadataStorage.instance.simpleCommands;
		const contextMenus = [
			...MetadataStorage.instance.applicationCommandMessages,
			...MetadataStorage.instance.applicationCommandUsers,
		];
		const commandsSum =
			slashCommands.length + simpleCommands.length + contextMenus.length;
		await this.log(
			'info',
			`✓ ${numberAlign(commandsSum)} commands loaded`,
			chalk.blue(
				`✓ ${numberAlign(commandsSum)} ${chalk.bold('commands')} loaded`,
			),
		);
		await this.log(
			'info',
			`\u200B  \u200B┝──╾ ${numberAlign(slashCommands.length)} slash commands\n\u200B  \u200B┝──╾ ${numberAlign(simpleCommands.length)} simple commands\n\u200B  \u200B╰──╾ ${numberAlign(contextMenus.length)} context menus`,
			chalk.dim.grey(
				`\u200B  \u200B┝──╾ ${numberAlign(slashCommands.length)} slash commands\n\u200B  \u200B┝──╾ ${numberAlign(simpleCommands.length)} simple commands\n\u200B  \u200B╰──╾ ${numberAlign(contextMenus.length)} context menus`,
			),
		);

		// events
		const events = MetadataStorage.instance.events;
		await this.log(
			'info',
			`✓ ${numberAlign(events.length)} events loaded`,
			chalk.yellowBright(
				`✓ ${numberAlign(events.length)} ${chalk.bold('events')} loaded`,
			),
		);

		// entities
		const entities = (await readdir(join('src', 'entities'))).filter(
			(entity) =>
				!entity.startsWith('index') && !entity.startsWith('BaseEntity'),
		);
		const pluginsEntitesCount = this.pluginsManager.plugins.reduce(
			(acc, plugin) => acc + Object.values(plugin.entities).length,
			0,
		);
		await this.log(
			'info',
			`✓ ${numberAlign(entities.length + pluginsEntitesCount)} entities loaded`,
			chalk.red(
				`✓ ${numberAlign(entities.length + pluginsEntitesCount)} ${chalk.bold('entities')} loaded`,
			),
		);

		// services
		const services = (await readdir(join('src', 'services'))).filter(
			(service) => !service.startsWith('index'),
		);
		const pluginsServicesCount = this.pluginsManager.plugins.reduce(
			(acc, plugin) => acc + Object.values(plugin.services).length,
			0,
		);
		await this.log(
			'info',
			`✓ ${numberAlign(services.length + pluginsServicesCount)} services loaded`,
			chalk.yellow(
				`✓ ${numberAlign(services.length + pluginsServicesCount)} ${chalk.bold('services')} loaded`,
			),
		);

		// api
		if (apiConfig.enabled) {
			const endpointsCount = Object.values(controllers).reduce(
				(acc, controller) => {
					const methodsName = Object.getOwnPropertyNames(
						controller.prototype,
					).filter((methodName) => methodName !== 'constructor');

					return acc + methodsName.length;
				},
				0,
			);
			await this.log(
				'info',
				`✓ ${numberAlign(endpointsCount)} api endpoints loaded`,
				chalk.cyan(
					`✓ ${numberAlign(endpointsCount)} ${chalk.bold('api endpoints')} loaded`,
				),
			);
		}

		// scheduled jobs
		const scheduledJobs = this.scheduler.jobs.size;
		await this.log(
			'info',
			`✓ ${numberAlign(scheduledJobs)} scheduled jobs loaded`,
			chalk.green(
				`✓ ${numberAlign(scheduledJobs)} ${chalk.bold('scheduled jobs')} loaded`,
			),
		);

		// translations
		await this.log(
			'info',
			`✓ ${numberAlign(locales.length)} translations loaded`,
			chalk.magenta(
				`✓ ${numberAlign(locales.length)} ${chalk.bold('translations')} loaded`,
			),
		);

		// plugins
		const pluginsCount = this.pluginsManager.plugins.length;
		await this.log(
			'info',
			`✓ ${numberAlign(pluginsCount)} plugin${pluginsCount > 1 ? 's' : ''} loaded`,
			chalk.green(
				`✓ ${numberAlign(pluginsCount)} ${chalk.bold(`plugin${pluginsCount > 1 ? 's' : ''}`)} loaded`,
			),
		);

		// connected
		if (apiConfig.enabled) {
			await this.log(
				'info',
				`API Server listening on port ${apiConfig.port.toString()}`,
				chalk.grey(
					boxen(`API Server listening on port ${chalk.bold(apiConfig.port)}`, {
						padding: { top: 0, bottom: 0, left: 1, right: 1 },
						margin: { top: 1, bottom: 0, left: 1, right: 1 },
						borderStyle: 'round',
						dimBorder: true,
					}),
				),
			);
		}

		await this.log(
			'info',
			`${this.client.user?.tag ?? 'Bot'} is connected!`,
			chalk.blue(
				boxen(
					`${chalk.bold(this.client.user?.tag ?? 'Bot')} is ${chalk.green('connected')}!`,
					{
						padding: { top: 0, bottom: 0, left: 1, right: 1 },
						margin: { top: 1, bottom: 1, left: 1 * 3, right: 1 * 3 },
						borderStyle: 'round',
						dimBorder: true,
					},
				),
			),
		);
	}
}
