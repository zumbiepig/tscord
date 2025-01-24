import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { appendFile, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';

import archiver from 'archiver';
import boxen from 'boxen';
import Case from 'case';
import chalk from 'chalk';
import {
	type BaseMessageOptions,
	type Snowflake,
	TextChannel,
	ThreadChannel,
	User,
} from 'discord.js';
import { Client, MetadataStorage } from 'discordx';
import ora from 'ora';
import { parse, type StackFrame } from 'stacktrace-parser';
import { delay, inject } from 'tsyringe';

import * as controllers from '@/api/controllers';
import { apiConfig, logsConfig } from '@/configs';
import env from '@/env';
import { locales } from '@/i18n';
import { Pastebin, PluginsManager, Scheduler } from '@/services';
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
import type { AllInteractions, InteractionsConstants } from '@/utils/types';

@Service()
export class Logger {
	private readonly logPath: string = join(cwd(), 'logs');
	private readonly logArchivePath: string = join(this.logPath, 'archives');

	private readonly levels = ['debug', 'info', 'warn', 'error'] as const;
	private embedLevelBuilder = {
		debug: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'DEBUG',
					description: message,
					color: 0x696969,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		info: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'INFO',
					description: message,
					color: 0x007fe7,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		warn: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'WARN',
					description: message,
					color: 0xf37100,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
		error: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'ERROR',
					description: message,
					color: 0x7c1715,
					timestamp: dayjsTimezone().toISOString(),
				},
			],
		}),
	};

	private interactionTypeReadable: Record<InteractionsConstants, string> = {
		CHAT_INPUT_COMMAND_INTERACTION: 'Slash command',
		SIMPLE_COMMAND_MESSAGE: 'Simple command',
		CONTEXT_MENU_INTERACTION: 'Context menu',
		BUTTON_INTERACTION: 'Button',
		SELECT_MENU_INTERACTION: 'Select menu',
		STRING_SELECT_MENU_INTERACTION: 'Select menu',
		MODAL_SUBMIT_INTERACTION: 'Modal submit',
	};

	private spinner = ora();

	private lastLogsTail: string[] = [];

	constructor(
		@inject(delay(() => Client)) private client: Client,
		@inject(delay(() => Scheduler)) private scheduler: Scheduler,
		@inject(delay(() => Pastebin)) private pastebin: Pastebin,
		@inject(delay(() => PluginsManager)) private pluginsManager: PluginsManager,
	) {}

	/**
	 * Helper function that will log in the console, and optionally in a file or discord channel depending on params.
	 * @param level debug | info | warn | error
	 * @param message message to log
	 * @param chalkedMessage chalked version of message to log to console
	 * @param logLocation where to log the message
	 */
	public async log(
		level: (typeof this.levels)[number],
		message: string,
		chalkedMessage: string | null = null,
		logLocation: {
			console?: boolean;
			file?: boolean;
			channelId?: Snowflake | null;
			discordEmbed?: BaseMessageOptions | null;
		} = {
			console: true,
			file: true,
			channelId: null,
			discordEmbed: null,
		},
	) {
		const date = dayjsTimezone();
		const formattedDate = formatDate(date, 'onlyDateFileName');
		const formattedTime = formatDate(date, 'logs');
		const formattedLevel = Case.upper(level);
		const trimmedMessage = message.trim();
		const logMessage = `[${formattedTime}] [${formattedLevel}] ${trimmedMessage}`;
		const chalkedLogMessage = `[${chalk.dim(formattedTime)}] [${formattedLevel}] ${chalkedMessage?.trim() ?? trimmedMessage}`;

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
			if (!existsSync(this.logPath)) await mkdir(this.logPath);
			await appendFile(
				join(this.logPath, `${formattedDate}.log`),
				logMessage + '\n',
			);
		}

		// send to discord channel
		if (logLocation.channelId) {
			if (this.client.token) {
				const channel = await this.client.channels
					.fetch(logLocation.channelId)
					.catch(() => null);
				if (
					channel &&
					(channel instanceof TextChannel || channel instanceof ThreadChannel)
				) {
					return await channel
						.send(
							logLocation.discordEmbed
								? logLocation.discordEmbed
								: this.embedLevelBuilder[level](logMessage),
						)
						.catch(async (error: unknown) => {
							await this.log(
								'error',
								`Couldn't log to Discord channel: ${error as string}`,
							);
						});
				}
			}
		}

		// save the last logs tail queue
		this.lastLogsTail.push(message);
		while (this.lastLogsTail.length > logsConfig.logTailMaxSize)
			this.lastLogsTail.shift();
	}

	/**
	 * Archive the logs in a tar.gz file each day, and delete log archives older than the retention period.
	 */
	@Schedule('0 0 * * *')
	public async archiveLogs() {
		if (!logsConfig.archive.enabled) return;

		if (!existsSync(this.logPath)) return;
		if (!existsSync(this.logArchivePath)) await mkdir(this.logArchivePath);

		const archive = archiver('tar', {
			gzip: true,
			gzipOptions: {
				level: 9,
			},
		});

		archive.pipe(
			createWriteStream(
				join(
					this.logArchivePath,
					`logs-${formatDate(dayjsTimezone().subtract(1, 'day'), 'onlyDateFileName')}.tar.gz`,
				),
			),
		);

		// add files to the archive
		for (const currentLogPath of (await readdir(this.logPath)).filter((file) =>
			file.endsWith('.log'),
		)) {
			const path = join(this.logPath, currentLogPath);
			archive.append(createReadStream(path), { name: currentLogPath });
			await rm(path);
		}

		// create archive
		await archive.finalize();

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

	/**
	 * Logs any interaction that is not excluded in the config.
	 * @param interaction
	 */
	public async logInteraction(interaction: AllInteractions) {
		const type = Case.constant(
			getTypeOfInteraction(interaction),
		) as InteractionsConstants;
		if (logsConfig.interaction.exclude.includes(type)) return;

		const action = resolveAction(interaction);
		const channel = resolveChannel(interaction);
		const guild = resolveGuild(interaction);
		const user = resolveUser(interaction);

		const message = `(${type}) "${action ?? ''}" ${channel instanceof TextChannel || channel instanceof ThreadChannel ? `in channel #${channel.name}` : ''} ${guild ? `in guild ${guild.name}` : ''} ${user ? `by ${user.username}#${user.discriminator}` : ''}`;
		const chalkedMessage = `(${chalk.bold.white(type)}) "${chalk.bold.green(action)}" ${channel instanceof TextChannel || channel instanceof ThreadChannel ? `${chalk.dim.italic.gray('in channel')} ${chalk.bold.blue(`#${channel.name}`)}` : ''} ${guild ? `${chalk.dim.italic.gray('in guild')} ${chalk.bold.blue(guild.name)}` : ''} ${user ? `${chalk.dim.italic.gray('by')} ${chalk.bold.blue(`${user.username}#${user.discriminator}`)}` : ''}`;

		await this.log('info', message, chalkedMessage, {
			...logsConfig.interaction,
			discordEmbed: {
				embeds: [
					{
						author: {
							name: user
								? `${user.username}#${user.discriminator}`
								: 'Unknown user',
							icon_url: user?.avatar
								? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
								: '',
						},
						title: `Interaction`,
						thumbnail: {
							url: guild?.iconURL({ forceStatic: true }) ?? '',
						},
						fields: [
							{
								name: 'Type',
								value: this.interactionTypeReadable[type],
								inline: true,
							},
							{
								name: '\u200B',
								value: '\u200B',
								inline: true,
							},
							{
								name: 'Action',
								value: action ?? 'Unknown',
								inline: true,
							},
							{
								name: 'Guild',
								value: guild ? guild.name : 'Unknown',
								inline: true,
							},
							{
								name: '\u200B',
								value: '\u200B',
								inline: true,
							},
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
						color: 0xdb5c21,
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
	public async logNewUser(user: User) {
		const message = `(NEW_USER) ${user.tag} (${user.id}) has been added to the db`;
		const chalkedMessage = `(${chalk.bold.white('NEW_USER')}) ${chalk.bold.green(user.tag)} (${chalk.bold.blue(user.id)}) ${chalk.dim.italic.gray('has been added to the db')}`;

		await this.log('info', message, chalkedMessage, {
			...logsConfig.newUser,
			discordEmbed: {
				embeds: [
					{
						title: 'New user',
						description: `**${user.tag}**`,
						thumbnail: {
							url: user.displayAvatarURL({ forceStatic: false }),
						},
						color: 0x83dd80,
						timestamp: dayjsTimezone().toISOString(),
						footer: {
							text: user.id,
						},
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
	public async logGuild(
		type: 'NEW_GUILD' | 'DELETE_GUILD' | 'RECOVER_GUILD',
		guildId: Snowflake,
	) {
		const guild = await this.client.guilds.fetch(guildId).catch(() => null);
		const additionalMessage =
			type === 'NEW_GUILD'
				? 'has been added to the db'
				: type === 'DELETE_GUILD'
					? 'has been deleted'
					: 'has been recovered';
		const message = `(${type}) Guild ${guild ? `${guild.name} (${guildId})` : guildId} ${additionalMessage}`;
		const chalkedMessage = `(${chalk.bold.white(type)}) ${chalk.dim.italic.gray('Guild')} ${guild ? `${chalk.bold.green(guild.name)} (${chalk.bold.blue(guildId)})` : guildId} ${chalk.dim.italic.gray(additionalMessage)}`;

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
						footer: {
							text: guild?.id ?? 'Unknown',
						},
						thumbnail: {
							url: guild?.iconURL() ?? '',
						},
						color:
							type === 'NEW_GUILD'
								? 0x02fd77
								: type === 'DELETE_GUILD'
									? 0xff0000
									: 0xfffb00,
						timestamp: dayjsTimezone().toISOString(),
					},
				],
			},
		});
	}

	/**
	 * Logs errors.
	 * @param error
	 * @param type uncaughtException | unhandledRejection
	 * @param trace
	 */
	public async logError(
		type: 'uncaughtException' | 'unhandledRejection',
		error: Error,
		trace: StackFrame[] = parse(error.stack ?? ''),
	) {
		let message = '(ERROR)';
		let chalkedMessage = `(${chalk.bold.white('ERROR')})`;
		let embedTitle = '';
		let embedMessage = '';

		if (trace[0]) {
			message += ` ${type === 'uncaughtException' ? 'Exception' : 'Unhandled rejection'} : ${error.message}\n${trace.map((frame: StackFrame) => `\t> ${frame.file ?? ''}:${frame.lineNumber?.toString() ?? ''}`).join('\n')}`;
			chalkedMessage += ` ${chalk.dim.italic.gray(type === 'uncaughtException' ? 'Exception' : 'Unhandled rejection')} : ${error.message}\n${chalk.dim.italic(trace.map((frame: StackFrame) => `\t> ${frame.file ?? ''}:${frame.lineNumber?.toString() ?? ''}`).join('\n'))}`;
			embedTitle += `***${type === 'uncaughtException' ? 'Exception' : 'Unhandled rejection'}* : ${error.message}**`;
			embedMessage += `\`\`\`\n${trace.map((frame: StackFrame) => `> ${frame.file ?? ''}:${frame.lineNumber?.toString() ?? ''}`).join('\n')}\n\`\`\``;
		} else {
			if (type === 'uncaughtException') {
				message += `An exception as occurred in a unknown file\n\t> ${error.message}`;
				chalkedMessage += `An exception as occurred in a unknown file\n\t> ${error.message}`;
				embedMessage += `An exception as occurred in a unknown file\n${error.message}`;
			} else {
				message += `An unhandled rejection as occurred in a unknown file\n\t> ${error}`;
				chalkedMessage += `An unhandled rejection as occurred in a unknown file\n\t> ${error}`;
				embedMessage += `An unhandled rejection as occurred in a unknown file\n${error}`;
			}
		}

		if (embedMessage.length > 4096) {
			const paste = await this.pastebin.createPaste(
				`${embedTitle}\n${embedMessage}`,
			);
			await this.log(
				'debug',
				'Error embed was too long, uploaded error to pastebin: ' +
					(paste?.getLink() ?? ''),
			);
			embedMessage = `[Pastebin of the error](https://rentry.co/${paste?.getLink() ?? ''})`;
		}

		await this.log('error', message, chalkedMessage, {
			...logsConfig.error,
			discordEmbed: {
				embeds: [
					{
						title:
							embedTitle.length > 256
								? `${embedTitle.substring(0, 252)}...`
								: embedTitle,
						description: embedMessage,
						color: 0x7c1715,
						timestamp: dayjsTimezone().toISOString(),
					},
				],
			},
		});
	}

	public getLastLogs() {
		return this.lastLogsTail;
	}

	public startSpinner(text: string) {
		this.spinner.start(text);
	}

	public async logStartingConsole() {
		this.spinner.stop();

		console.log('\n');
		await this.log(
			'info',
			'━━━━━━━━━━ Started! ━━━━━━━━━━',
			chalk.dim.gray('━━━━━━━━━━ Started! ━━━━━━━━━━'),
		);
		console.log('\n');

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
			chalk.dim.gray(
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
		const entities = (await readdir(join(cwd(), 'src', 'entities'))).filter(
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
		const services = (await readdir(join(cwd(), 'src', 'services'))).filter(
			(service) => !service.startsWith('index'),
		);
		const pluginsServicesCount = this.pluginsManager.plugins.reduce(
			(acc, plugin) => acc + Object.values(plugin.services).length,
			0,
		);
		await this.log(
			'info',
			`✓ ${numberAlign(services.length + pluginsServicesCount)} services loaded`,
			chalk.hex('ffc107')(
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
			chalk.hex('ab47bc')(
				`✓ ${numberAlign(locales.length)} ${chalk.bold('translations')} loaded`,
			),
		);

		// plugins
		const pluginsCount = this.pluginsManager.plugins.length;
		await this.log(
			'info',
			`✓ ${numberAlign(pluginsCount)} plugin${pluginsCount > 1 ? 's' : ''} loaded`,
			chalk.hex('#47d188')(
				`✓ ${numberAlign(pluginsCount)} ${chalk.bold(`plugin${pluginsCount > 1 ? 's' : ''}`)} loaded`,
			),
		);

		// connected
		if (apiConfig.enabled) {
			await this.log(
				'info',
				boxen(
					` API Server listening on port ${env.API_PORT?.toString() ?? ''} `,
					{
						padding: 0,
						margin: {
							top: 1,
							bottom: 0,
							left: 1,
							right: 1,
						},
						borderStyle: 'round',
						dimBorder: true,
					},
				),
				chalk.gray(
					boxen(` API Server listening on port ${chalk.bold(env.API_PORT)} `, {
						padding: 0,
						margin: {
							top: 1,
							bottom: 0,
							left: 1,
							right: 1,
						},
						borderStyle: 'round',
						dimBorder: true,
					}),
				),
			);
		}

		await this.log(
			'info',
			boxen(
				` ${this.client.user ? this.client.user.tag : 'Bot'} is connected! `,
				{
					padding: 0,
					margin: {
						top: 1,
						bottom: 1,
						left: 1 * 3,
						right: 1 * 3,
					},
					borderStyle: 'round',
					dimBorder: true,
				},
			),
			chalk.hex('7289DA')(
				boxen(
					` ${this.client.user ? chalk.bold(this.client.user.tag) : 'Bot'} is ${chalk.green('connected')}! `,
					{
						padding: 0,
						margin: {
							top: 1,
							bottom: 1,
							left: 1 * 3,
							right: 1 * 3,
						},
						borderStyle: 'round',
						dimBorder: true,
					},
				),
			),
		);
	}
}
