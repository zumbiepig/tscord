import { createWriteStream, existsSync } from 'node:fs';
import {
	appendFile,
	mkdir,
	readdir,
	rm,
} from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';

import archiver from 'archiver';
import boxen from 'boxen';
import { constant } from 'case';
import chalk from 'chalk';
import dayjs from 'dayjs';
import {
	type BaseMessageOptions,
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
import { Pastebin, PluginsManager, Scheduler, Store } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	formatDate,
	getTypeOfInteraction,
	numberAlign,
	resolveAction,
	resolveChannel,
	resolveDependency,
	resolveGuild,
	resolveUser,
	validString,
} from '@/utils/functions';
import type { AllInteractions, InteractionsConstants } from '@/utils/types';

@Service()
export class Logger {
	private readonly logPath: string = join(cwd(), 'logs');
	private readonly logArchivePath: string = join(this.logPath, 'archives');

	private readonly levels = ['info', 'warn', 'error'] as const;
	private embedLevelBuilder = {
		info: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'INFO',
					description: message,
					color: 0x007fe7,
					timestamp: new Date().toISOString(),
				},
			],
		}),
		warn: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'WARN',
					description: message,
					color: 0xf37100,
					timestamp: new Date().toISOString(),
				},
			],
		}),
		error: (message: string): BaseMessageOptions => ({
			embeds: [
				{
					title: 'ERROR',
					description: message,
					color: 0x7c1715,
					timestamp: new Date().toISOString(),
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
		@inject(delay(() => Store)) private store: Store,
		@inject(delay(() => Pastebin)) private pastebin: Pastebin,
		@inject(delay(() => PluginsManager)) private pluginsManager: PluginsManager,
	) {
		if (!this.store.get('botHasBeenReloaded')) {
			console.info = (...args: string[]) => {
				void this.baseLog('info', ...args);
			};
			console.warn = (...args: string[]) => {
				void this.baseLog('warn', ...args);
			};
			console.error = (...args: string[]) => {
				void this.baseLog('error', ...args);
			};
		}
	}

	private async baseLog(
		level: (typeof this.levels)[number],
		...args: string[]
	) {
		const excludedPatterns = ['[typesafe-i18n]'];

		const message = args.join(', ');

		if (!excludedPatterns.some((pattern) => message.includes(pattern))) {
			await this.log(message, level);
		}
	}

	/**
	 * Log a message in the console.
	 * @param message the message to log
	 * @param level info (default) | warn | error
	 * @param ignoreTemplate if it should ignore the timestamp template (default to false)
	 */
	console(
		message: string,
		level: (typeof this.levels)[number] = 'info',
		ignoreTemplate = false,
	) {
		if (this.spinner.isSpinning) this.spinner.stop();

		if (!validString(message)) return;

		let templatedMessage = ignoreTemplate
			? message
			: `${level} [${chalk.dim.gray(formatDate(new Date()))}] ${message}`;
		if (level === 'error') templatedMessage = chalk.red(templatedMessage);

		console[level](templatedMessage);

		// save the last logs tail queue
		if (this.lastLogsTail.length >= logsConfig.logTailMaxSize)
			this.lastLogsTail.shift();

		this.lastLogsTail.push(message);
	}

	/**
	 * Log a message in a log file.
	 * @param message the message to log
	 * @param level info (default) | warn | error
	 */
	async file(message: string, level: (typeof this.levels)[number] = 'info') {
		if (!validString(message)) return;

		// create the folder if it doesn't exist
		if (!existsSync(this.logPath)) await mkdir(this.logPath);

		await appendFile(join(this.logPath, `${level}.log`), `[${formatDate(new Date())}] ${message}\n`);
	}

	/**
	 * Log a message in a Discord channel using embeds.
	 * @param channelId the ID of the discord channel to log to
	 * @param message the message to log or a [MessageOptions](https://discord.js.org/#/docs/discord.js/main/typedef/BaseMessageOptions) compliant object (like embeds, components, etc)
	 * @param level info (default) | warn | error
	 */
	async discordChannel(
		channelId: string,
		message: string | BaseMessageOptions,
		level?: (typeof this.levels)[number],
	) {
		if (!this.client.token) return;

		const channel = await this.client.channels
			.fetch(channelId)
			.catch(() => null);

		if (
			(channel && channel instanceof TextChannel) ||
			channel instanceof ThreadChannel
		) {
			if (typeof message !== 'string')
				return channel.send(message).catch((error: unknown) => {
					console.error(error);
				});

			channel
				.send(this.embedLevelBuilder[level ?? 'info'](message))
				.catch((error: unknown) => {
					console.error(error);
				});
		}
	}

	/**
	 * Archive the logs in a zip file each day.
	 */
	@Schedule('0 0 * * *')
	async archiveLogs() {
		if (!logsConfig.archive.enabled) return;

		if (!existsSync(this.logPath)) return;
		if (!existsSync(this.logArchivePath)) await mkdir(this.logArchivePath);

		const archive = archiver('zip', {
			zlib: { level: 9 }
		});

		archive.pipe(createWriteStream(
			join(this.logArchivePath, `logs-${dayjs().subtract(1, 'day').format('YYYY-MM-DD')}.zip`),
		));

		// add files to the archive
		for (const currentLogPath of (await readdir(this.logPath)).filter((file) => file.endsWith('.log'))) {
			const path = join(this.logPath, currentLogPath);
			archive.file(path, { name: currentLogPath });
			await rm(path);
		}

		// create archive
		await archive.finalize();

		// retention policy
		for (const file of await readdir(this.logArchivePath)) {
			const match = /^logs-(.+).zip$/.exec(file);
			if (match?.[1]) {
				const date = dayjs(match[1]);
				if (date.isBefore(dayjs().subtract(logsConfig.archive.retention, 'day')))
					await rm(join(this.logArchivePath, file));
			}
		}
	}

	/**
	 * Helper function that will log in the console, and optionally in a file or discord channel depending on params.
	 * @param message message to log
	 * @param level info (default) | warn | error
	 * @param saveToFile if true, the message will be saved to a file (default to true)
	 * @param channelId Discord channel to log to (if `null`, nothing will be logged to Discord)
	 */
	async log(
		message: string,
		level: (typeof this.levels)[number] = 'info',
		saveToFile = true,
		channelId: string | null = null,
	) {
		if (message === '') return;

		// log in the console
		this.console(message, level);

		// save log to file
		if (saveToFile) await this.file(message, level);

		// send to discord channel
		if (channelId) await this.discordChannel(channelId, message, level);
	}

	/**
	 * Logs any interaction that is not excluded in the config.
	 * @param interaction
	 */
	async logInteraction(interaction: AllInteractions) {
		const type = constant(
			getTypeOfInteraction(interaction),
		) as InteractionsConstants;
		if (logsConfig.interaction.exclude.includes(type)) return;

		const action = resolveAction(interaction);
		const channel = resolveChannel(interaction);
		const guild = resolveGuild(interaction);
		const user = resolveUser(interaction);

		const message = `(${type}) "${action ?? ''}" ${channel instanceof TextChannel || channel instanceof ThreadChannel ? `in channel #${channel.name}` : ''} ${guild ? `in guild ${guild.name}` : ''} ${user ? `by ${user.username}#${user.discriminator}` : ''}`;
		const chalkedMessage = `(${chalk.bold.white(type)}) "${chalk.bold.green(action)}" ${channel instanceof TextChannel || channel instanceof ThreadChannel ? `${chalk.dim.italic.gray('in channel')} ${chalk.bold.blue(`#${channel.name}`)}` : ''} ${guild ? `${chalk.dim.italic.gray('in guild')} ${chalk.bold.blue(guild.name)}` : ''} ${user ? `${chalk.dim.italic.gray('by')} ${chalk.bold.blue(`${user.username}#${user.discriminator}`)}` : ''}`;

		if (logsConfig.interaction.console) this.console(chalkedMessage);
		if (logsConfig.interaction.file) await this.file(message);
		if (logsConfig.interaction.channel) {
			await this.discordChannel(logsConfig.interaction.channel, {
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
						timestamp: new Date().toISOString(),
					},
				],
			});
		}
	}

	/**
	 * Logs all new users.
	 * @param user
	 */
	async logNewUser(user: User) {
		const message = `(NEW_USER) ${user.tag} (${user.id}) has been added to the db`;
		const chalkedMessage = `(${chalk.bold.white('NEW_USER')}) ${chalk.bold.green(user.tag)} (${chalk.bold.blue(user.id)}) ${chalk.dim.italic.gray('has been added to the db')}`;

		if (logsConfig.newUser.console) this.console(chalkedMessage);
		if (logsConfig.newUser.file) await this.file(message);
		if (logsConfig.newUser.channel) {
			await this.discordChannel(logsConfig.newUser.channel, {
				embeds: [
					{
						title: 'New user',
						description: `**${user.tag}**`,
						thumbnail: {
							url: user.displayAvatarURL({ forceStatic: false }),
						},
						color: 0x83dd80,
						timestamp: new Date().toISOString(),
						footer: {
							text: user.id,
						},
					},
				],
			});
		}
	}

	/**
	 * Logs all 'actions' (create, delete, etc) of a guild.
	 * @param type NEW_GUILD, DELETE_GUILD, RECOVER_GUILD
	 * @param guildId
	 */
	async logGuild(
		type: 'NEW_GUILD' | 'DELETE_GUILD' | 'RECOVER_GUILD',
		guildId: string,
	) {
		const additionalMessage =
			type === 'NEW_GUILD'
				? 'has been added to the db'
				: type === 'DELETE_GUILD'
					? 'has been deleted'
					: 'has been recovered';

		await resolveDependency(Client).then(async (client) => {
			const guild = await client.guilds.fetch(guildId).catch(() => null);

			const message = `(${type}) Guild ${guild ? `${guild.name} (${guildId})` : guildId} ${additionalMessage}`;
			const chalkedMessage = `(${chalk.bold.white(type)}) ${chalk.dim.italic.gray('Guild')} ${guild ? `${chalk.bold.green(guild.name)} (${chalk.bold.blue(guildId)})` : guildId} ${chalk.dim.italic.gray(additionalMessage)}`;

			if (logsConfig.guild.console) this.console(chalkedMessage);
			if (logsConfig.guild.file) await this.file(message);
			if (logsConfig.guild.channel) {
				await this.discordChannel(logsConfig.guild.channel, {
					embeds: [
						{
							title:
								type === 'NEW_GUILD'
									? 'New guild'
									: type === 'DELETE_GUILD'
										? 'Deleted guild'
										: 'Recovered guild',

							// description: `**${guild.name} (\`${guild.id}\`)**\n${guild.memberCount} members`,
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
							timestamp: new Date().toISOString(),
						},
					],
				});
			}
		});
	}

	/**
	 * Logs errors.
	 * @param error
	 * @param type uncaughtException, unhandledRejection
	 * @param trace
	 */
	async logError(
		error: Error,
		type: 'uncaughtException' | 'unhandledRejection',
		trace: StackFrame[] = parse(error.stack ?? ''),
	) {
		let message = '(ERROR)';
		let embedMessage = '';
		let embedTitle = '';
		let chalkedMessage = `(${chalk.bold.white('ERROR')})`;

		if (trace[0]) {
			message += ` ${type === 'uncaughtException' ? 'Exception' : 'Unhandled rejection'} : ${error.message}\n${trace.map((frame: StackFrame) => `\t> ${frame.file ?? ''}:${frame.lineNumber?.toString() ?? ''}`).join('\n')}`;
			embedMessage += `\`\`\`\n${trace.map((frame: StackFrame) => `> ${frame.file ?? ''}:${frame.lineNumber?.toString() ?? ''}`).join('\n')}\n\`\`\``;
			embedTitle += `***${type === 'uncaughtException' ? 'Exception' : 'Unhandled rejection'}* : ${error.message}**`;
			chalkedMessage += ` ${chalk.dim.italic.gray(type === 'uncaughtException' ? 'Exception' : 'Unhandled rejection')} : ${error.message}\n${chalk.dim.italic(trace.map((frame: StackFrame) => `\t> ${frame.file ?? ''}:${frame.lineNumber?.toString() ?? ''}`).join('\n'))}`;
		} else {
			if (type === 'uncaughtException') {
				message += `An exception as occurred in a unknown file\n\t> ${error.message}`;
				embedMessage += `An exception as occurred in a unknown file\n${error.message}`;
			} else {
				message += `An unhandled rejection as occurred in a unknown file\n\t> ${error}`;
				embedMessage += `An unhandled rejection as occurred in a unknown file\n${error}`;
			}
		}

		if (embedMessage.length >= 4096) {
			const paste = await this.pastebin.createPaste(
				`${embedTitle}\n${embedMessage}`,
			);
			console.log(paste?.getLink());
			embedMessage = `[Pastebin of the error](https://rentry.co/${paste?.getLink() ?? ''})`;
		}

		if (logsConfig.error.console) this.console(chalkedMessage, 'error');
		if (logsConfig.error.file) await this.file(message, 'error');
		if (logsConfig.error.channel && env.isProduction) {
			await this.discordChannel(
				logsConfig.error.channel,
				{
					embeds: [
						{
							title:
								embedTitle.length >= 256
									? `${embedTitle.substring(0, 252)}...`
									: embedTitle,
							description: embedMessage,
							color: 0x7c1715,
							timestamp: new Date().toISOString(),
						},
					],
				},
				'error',
			);
		}
	}

	getLastLogs() {
		return this.lastLogsTail;
	}

	startSpinner(text: string) {
		this.spinner.start(text);
	}

	async logStartingConsole() {
		const symbol = '✓';
		const tab = '\u200B  \u200B';

		this.spinner.stop();

		this.console(
			chalk.dim.gray('\n━━━━━━━━━━ Started! ━━━━━━━━━━\n'),
			'info',
			true,
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

		this.console(
			chalk.blue(
				`${symbol} ${numberAlign(commandsSum)} ${chalk.bold('commands')} loaded`,
			),
			'info',
			true,
		);
		this.console(
			chalk.dim.gray(
				`${tab}┝──╾ ${numberAlign(slashCommands.length)} slash commands\n${tab}┝──╾ ${numberAlign(simpleCommands.length)} simple commands\n${tab}╰──╾ ${numberAlign(contextMenus.length)} context menus`,
			),
			'info',
			true,
		);

		// events
		const events = MetadataStorage.instance.events;

		this.console(
			chalk.yellowBright(
				`${symbol} ${numberAlign(events.length)} ${chalk.bold('events')} loaded`,
			),
			'info',
			true,
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

		this.console(
			chalk.red(
				`${symbol} ${numberAlign(entities.length + pluginsEntitesCount)} ${chalk.bold('entities')} loaded`,
			),
			'info',
			true,
		);

		// services
		const services = (await readdir(join(cwd(), 'src', 'services'))).filter(
			(service) => !service.startsWith('index'),
		);

		const pluginsServicesCount = this.pluginsManager.plugins.reduce(
			(acc, plugin) => acc + Object.values(plugin.services).length,
			0,
		);

		this.console(
			chalk.hex('ffc107')(
				`${symbol} ${numberAlign(services.length + pluginsServicesCount)} ${chalk.bold('services')} loaded`,
			),
			'info',
			true,
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

			this.console(
				chalk.cyan(
					`${symbol} ${numberAlign(endpointsCount)} ${chalk.bold('api endpoints')} loaded`,
				),
				'info',
				true,
			);
		}

		// scheduled jobs
		const scheduledJobs = this.scheduler.jobs.size;
		this.console(
			chalk.green(
				`${symbol} ${numberAlign(scheduledJobs)} ${chalk.bold('scheduled jobs')} loaded`,
			),
			'info',
			true,
		);

		// translations
		this.console(
			chalk.hex('ab47bc')(
				`${symbol} ${numberAlign(locales.length)} ${chalk.bold('translations')} loaded`,
			),
			'info',
			true,
		);

		// plugins
		const pluginsCount = this.pluginsManager.plugins.length;

		this.console(
			chalk.hex('#47d188')(
				`${symbol} ${numberAlign(pluginsCount)} ${chalk.bold(`plugin${pluginsCount > 1 ? 's' : ''}`)} loaded`,
			),
			'info',
			true,
		);

		// connected
		if (apiConfig.enabled) {
			this.console(
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
				'info',
				true,
			);
		}

		this.console(
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
			'info',
			true,
		);
	}
}
