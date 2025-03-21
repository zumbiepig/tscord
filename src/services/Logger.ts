import { createReadStream, createWriteStream } from 'node:fs';
import { appendFile, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';

import archiver from 'archiver';
import boxen from 'boxen';
import chalk from 'chalk';
import {
	AttachmentBuilder,
	type BaseInteraction,
	type BaseMessageOptions,
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
import { locales as i18nLocales } from '@/i18n';
import { PluginsManager, Scheduler } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	dayjsTimezone,
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
	private readonly logPath: string = join(process.cwd(), 'logs');
	private readonly logArchivePath: string = join(this.logPath, 'archives');

	private embedLevelBuilder = {
		debug: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'DEBUG',
					description: message,
					color: colorsConfig.logs.debug,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		info: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'INFO',
					description: message,
					color: colorsConfig.logs.info,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		warn: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'WARN',
					description: message,
					color: colorsConfig.logs.warn,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		error: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'ERROR',
					description: message,
					color: colorsConfig.logs.error,
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
		level: 'debug' | 'info' | 'warn' | 'error',
		message: string,
		chalkedMessage?: string,
		logLocation: {
			console?: boolean;
			file?: boolean;
			channelId?: Snowflake | undefined;
			discordEmbed?: BaseMessageOptions;
		} = {},
	): Promise<void> {
		const date = dayjsTimezone();
		const formattedDate = date.format('YYYY-MM-DD');
		const formattedTime = date.format('YYYY-MM-DD HH:mm:ss');
		const formattedLevel = level.toUpperCase();
		const trimmedMessage = message.trim();
		const logMessage = `[${formattedTime}] [${formattedLevel}] ${trimmedMessage}`;
		const chalkedLogMessage = `[${chalk.dim(formattedTime)}] [${formattedLevel}] ${chalkedMessage?.trim() ?? trimmedMessage}`;

		// set default values
		logLocation.console ??= logsConfig.system.console;
		logLocation.file ??= logsConfig.system.file;
		logLocation.channelId ??= logsConfig.system.channelId;
		logLocation.discordEmbed ??= this.embedLevelBuilder[level](logMessage);

		// log to console
		if (logLocation.console) {
			switch (level) {
				case 'debug': {
					console.debug(chalk.grey(chalkedLogMessage));
					break;
				}
				case 'info': {
					console.info(chalk.cyan(chalkedLogMessage));
					break;
				}
				case 'warn': {
					console.warn(chalk.yellow(chalkedLogMessage));
					break;
				}
				case 'error': {
					console.error(chalk.red(chalkedLogMessage));
					break;
				}
			}
		}

		// save log to file
		if (logLocation.file) {
			await mkdir(this.logPath, { recursive: true });
			await appendFile(join(this.logPath, `${formattedDate}.log`), logMessage + '\n');
		}

		// send to discord channel
		if (logLocation.channelId) {
			while (!this.client.token) await setTimeout(50);

			const channel = await this.client.channels.fetch(logLocation.channelId).catch(() => {});
			if (channel && 'send' in channel) await channel.send(logLocation.discordEmbed);
		}

		// save the last logs tail queue
		this._lastLogsTail.push(message);
		while (this._lastLogsTail.length > logsConfig.logTailMaxSize) this._lastLogsTail.shift();
	}

	/**
	 * Logs errors.
	 * @param error
	 * @param type uncaughtException | unhandledRejection
	 * @param trace
	 */
	async logError(type: 'uncaughtException' | 'unhandledRejection', error: Error): Promise<void> {
		const message = `(ERROR) ${error.stack ?? error.message}`;
		const chalkedMessage = `(${chalk.bold.white('ERROR')}) ${chalk.dim.italic(error.stack ?? error.message)}`;

		const embedTitle = `**${
			type === 'uncaughtException' ? 'Uncaught Exception: ' : 'Unhandled Rejection: '
		}**${error.message}`;
		let embedMessage = '```\n' + (error.stack ?? error.message) + '\n```';
		const embedAttachments = [];

		if (embedMessage.length > 4096) {
			embedMessage =
				'```\n' + (error.message.length > 4088 ? `${error.message.slice(0, 4087)}…` : error.message) + '\n```';
			embedAttachments.push(new AttachmentBuilder(Buffer.from(error.stack ?? error.message)));
		}

		await this.log('error', message, chalkedMessage, {
			...logsConfig.error,
			discordEmbed: {
				embeds: [
					{
						title: embedTitle.length > 256 ? `${embedTitle.slice(0, 255)}…` : embedTitle,
						description: embedMessage,
						color: colorsConfig.logs.error,
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
	async logInteraction(interaction: BaseInteraction | SimpleCommandMessage): Promise<void> {
		const type = getTypeOfInteraction(interaction);

		const action = resolveAction(interaction);
		const channel = resolveChannel(interaction);
		const guild = resolveGuild(interaction);
		const user = resolveUser(interaction);

		const message = `(${type}) "${action}" ${(channel?.isTextBased() && !channel.isDMBased()) ? `in channel #${channel.name}` : ''} ${guild ? `in guild ${guild.name}` : ''} by ${user.username}#${user.discriminator}`;
		const chalkedMessage = `(${chalk.bold.white(type)}) "${chalk.bold.green(action)}" ${channel?.isTextBased() && !channel.isDMBased() ? `${chalk.dim.italic.grey('in channel')} ${chalk.bold.blue(`#${channel.name}`)}` : ''} ${guild ? `${chalk.dim.italic.grey('in guild')} ${chalk.bold.blue(guild.name)}` : ''} ${chalk.dim.italic.grey('by')} ${chalk.bold.blue(`${user.username}#${user.discriminator}`)}`;

		await this.log('info', message, chalkedMessage, {
			...logsConfig.interaction,
			discordEmbed: {
				embeds: [
					{
						author: {
							name: `${user.username}#${user.discriminator}`,
							icon_url: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}` : '',
						},
						title: `Interaction`,
						thumbnail: { url: guild?.iconURL() ?? '' },
						fields: [
							{ name: 'Type', value: type, inline: true },
							{ name: '\u200B', value: '\u200B', inline: true },
							{ name: 'Action', value: action, inline: true },
							{ name: 'Guild', value: guild?.name ?? 'Unknown', inline: true },
							{ name: '\u200B', value: '\u200B', inline: true },
							{
								name: 'Channel',
								value:
									channel?.isTextBased() && !channel.isDMBased() ? `#${channel.name}` : 'Unknown',
								inline: true,
							},
						],
						color: colorsConfig.discord.interaction,
						timestamp: dayjsTimezone().toISOString(),
					},
				],
			},
		});
	}

	/**
	 * Logs all 'actions' (create, delete, etc) of a user.
	 * @param type NEW_USER | DELETE_USER | RECOVER_USER
	 * @param user
	 */
	async logUser(type: 'NEW_USER' | 'DELETE_USER' | 'RECOVER_USER', user: User): Promise<void> {
		const additionalMessage =
			type === 'NEW_USER'
				? 'has been added to the db'
				: type === 'DELETE_USER'
					? 'has been deleted'
					: 'has been recovered';
		const message = `(${type}) ${user.tag} (${user.id}) ${additionalMessage}`;
		const chalkedMessage = `(${chalk.bold.white(type)}) ${chalk.bold.green(user.tag)} (${chalk.bold.blue(user.id)}) ${chalk.dim.italic.grey(additionalMessage)}`;

		await this.log('info', message, chalkedMessage, {
			...logsConfig.user,
			discordEmbed: {
				embeds: [
					{
						title: type === 'NEW_USER' ? 'New user' : type === 'DELETE_USER' ? 'Deleted user' : 'Recovered user',
						description: `**${user.tag}**`,
						thumbnail: { url: user.displayAvatarURL() },
						color:
							type === 'NEW_USER'
								? colorsConfig.discord.user.new
								: type === 'DELETE_USER'
									? colorsConfig.discord.user.delete
									: colorsConfig.discord.user.recover,
						timestamp: dayjsTimezone().toISOString(),
						footer: { text: user.id },
					},
				],
			},
		});
	}

	/**
	 * Logs all 'actions' (create, delete, etc) of a guild.
	 * @param type NEW_GUILD | DELETE_GUILD | RECOVER_GUILD
	 * @param guildId
	 */
	async logGuild(type: 'NEW_GUILD' | 'DELETE_GUILD' | 'RECOVER_GUILD', guildId: Snowflake): Promise<void> {
		const guild = await this.client.guilds.fetch(guildId).catch(() => this.client.guilds.cache.get(guildId));
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
						title: type === 'NEW_GUILD' ? 'New guild' : type === 'DELETE_GUILD' ? 'Deleted guild' : 'Recovered guild',
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
								? colorsConfig.discord.guild.new
								: type === 'DELETE_GUILD'
									? colorsConfig.discord.guild.delete
									: colorsConfig.discord.guild.recover,
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
				join(this.logArchivePath, `logs-${dayjsTimezone().subtract(1, 'day').format('YYYY-MM-DD')}.tar.gz`),
			),
		);

		// add files to the archive
		const logPaths = [];
		for (const currentLogPath of (await readdir(this.logPath)).filter((file) => file.endsWith('.log'))) {
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
			if (match?.[1] && timeAgo(match[1], 'day') > logsConfig.archive.retentionDays) {
				await this.log(
					'info',
					`Deleting log archive ${file} older than ${logsConfig.archive.retentionDays.toString()} days`,
					`Deleting log archive ${chalk.bold.red(file)} older than ${chalk.bold.red(logsConfig.archive.retentionDays.toString())} days`,
				);
				await rm(join(this.logArchivePath, file));
			}
		}
	}

	async startSpinner(text: string): Promise<void> {
		console.log('\n');
		this.spinner.start(text);
		await this.log('info', text, undefined, { console: false });
	}

	async logStartingConsole(): Promise<void> {
		this.spinner.stop();

		await this.log('info', '━━━━━━━━━━ Started! ━━━━━━━━━━', chalk.green('\n━━━━━━━━━━ Started! ━━━━━━━━━━\n'));

		// commands
		const slashCommands = MetadataStorage.instance.applicationCommandSlashes;
		const simpleCommands = MetadataStorage.instance.simpleCommands;
		const contextMenus = [
			...MetadataStorage.instance.applicationCommandMessages,
			...MetadataStorage.instance.applicationCommandUsers,
		];
		const commandsSum = slashCommands.length + simpleCommands.length + contextMenus.length;
		await this.log(
			'info',
			`✓ ${numberAlign(commandsSum)} commands loaded`,
			chalk.blue(`✓ ${numberAlign(commandsSum)} ${chalk.bold('commands')} loaded`),
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
			chalk.yellowBright(`✓ ${numberAlign(events.length)} ${chalk.bold('events')} loaded`),
		);

		// entities
		const entities = (await readdir(join('src', 'entities'))).filter(
			(entity) => !entity.startsWith('index') && !entity.startsWith('BaseEntity'),
		);
		const pluginsEntitesCount = this.pluginsManager.plugins.reduce(
			(acc, plugin) => acc + Object.values(plugin.entities).length,
			0,
		);
		await this.log(
			'info',
			`✓ ${numberAlign(entities.length + pluginsEntitesCount)} entities loaded`,
			chalk.red(`✓ ${numberAlign(entities.length + pluginsEntitesCount)} ${chalk.bold('entities')} loaded`),
		);

		// services
		const services = (await readdir(join('src', 'services'))).filter((service) => !service.startsWith('index'));
		const pluginsServicesCount = this.pluginsManager.plugins.reduce(
			(acc, plugin) => acc + Object.values(plugin.services).length,
			0,
		);
		await this.log(
			'info',
			`✓ ${numberAlign(services.length + pluginsServicesCount)} services loaded`,
			chalk.yellow(`✓ ${numberAlign(services.length + pluginsServicesCount)} ${chalk.bold('services')} loaded`),
		);

		// api
		if (apiConfig.enabled) {
			const endpointsCount = Object.values(controllers).reduce((acc, controller) => {
				const methodsName = Object.getOwnPropertyNames(controller.prototype).filter(
					(methodName) => methodName !== 'constructor',
				);

				return acc + methodsName.length;
			}, 0);
			await this.log(
				'info',
				`✓ ${numberAlign(endpointsCount)} api endpoints loaded`,
				chalk.cyan(`✓ ${numberAlign(endpointsCount)} ${chalk.bold('api endpoints')} loaded`),
			);
		}

		// scheduled jobs
		const scheduledJobs = this.scheduler.jobs.size;
		await this.log(
			'info',
			`✓ ${numberAlign(scheduledJobs)} scheduled jobs loaded`,
			chalk.green(`✓ ${numberAlign(scheduledJobs)} ${chalk.bold('scheduled jobs')} loaded`),
		);

		// translations
		await this.log(
			'info',
			`✓ ${numberAlign(i18nLocales.length)} translations loaded`,
			chalk.magenta(`✓ ${numberAlign(i18nLocales.length)} ${chalk.bold('translations')} loaded`),
		);

		// plugins
		const pluginsCount = this.pluginsManager.plugins.length;
		await this.log(
			'info',
			`✓ ${numberAlign(pluginsCount)} plugin${pluginsCount > 1 ? 's' : ''} loaded`,
			chalk.green(`✓ ${numberAlign(pluginsCount)} ${chalk.bold(`plugin${pluginsCount > 1 ? 's' : ''}`)} loaded`),
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
				boxen(`${chalk.bold(this.client.user?.tag ?? 'Bot')} is ${chalk.green('connected')}!`, {
					padding: { top: 0, bottom: 0, left: 1, right: 1 },
					margin: { top: 1, bottom: 1, left: 1 * 3, right: 1 * 3 },
					borderStyle: 'round',
					dimBorder: true,
				}),
			),
		);
	}
}
