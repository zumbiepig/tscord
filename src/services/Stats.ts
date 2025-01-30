import process from 'node:process';

import { EntityRepository } from '@mikro-orm/core';
import Case from 'case';
import { Client, SimpleCommandMessage } from 'discordx';
import osu from 'node-os-utils';
import pidusage from 'pidusage';
import { delay, inject } from 'tsyringe';

import { statsConfig } from '@/configs';
import { Guild, Stat, User } from '@/entities';
import { Database } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	dayjsTimezone,
	formatDate,
	getTypeOfInteraction,
	resolveAction,
	resolveChannel,
	resolveGuild,
	resolveUser,
} from '@/utils/functions';
import type {
	AllInteractions,
	InteractionsConstants,
	StatPerInterval,
} from '@/utils/types';

const allInteractions = {
	$or: [
		{ type: 'SIMPLE_COMMAND_MESSAGE' },
		{ type: 'CHAT_INPUT_COMMAND_INTERACTION' },
		{ type: 'USER_CONTEXT_MENU_COMMAND_INTERACTION' },
		{ type: 'MESSAGE_CONTEXT_MENU_COMMAND_INTERACTION' },
	],
};

@Service()
export class Stats {
	private statsRepo: EntityRepository<Stat>;

	constructor(
		private db: Database,
		@inject(delay(() => Client)) private client: Client,
	) {
		this.statsRepo = this.db.get(Stat);
	}

	/**
	 * Add an entry to the stats table.
	 * @param type
	 * @param value
	 * @param additionalData in JSON format
	 */
	async register(type: string, value: string, additionalData?: unknown) {
		const stat = new Stat();
		stat.type = type;
		stat.value = value;
		if (additionalData) stat.additionalData = additionalData;

		await this.db.em.persistAndFlush(stat);
	}

	/**
	 * Record an interaction and add it to the database.
	 * @param interaction
	 */
	async registerInteraction(interaction: AllInteractions) {
		// we extract data from the interaction
		const type = Case.constant(
			getTypeOfInteraction(interaction),
		) as InteractionsConstants;
		if (statsConfig.interaction.exclude.includes(type)) return;

		const value = resolveAction(interaction);
		const additionalData = {
			user: resolveUser(interaction)?.id,
			guild: resolveGuild(interaction)?.id ?? 'dm',
			channel: resolveChannel(interaction)?.id,
		};

		// add it to the db
		await this.register(type, value ?? '', additionalData);
	}

	/**
	 * Record a simple command message and add it to the database.
	 * @param command
	 */
	async registerSimpleCommand(command: SimpleCommandMessage) {
		// we extract data from the interaction
		const type = 'SIMPLE_COMMAND_MESSAGE';
		const value = command.name;
		const additionalData = {
			user: command.message.author.id,
			guild: command.message.guild?.id ?? 'dm',
			channel: command.message.channel.id,
		};

		// add it to the db
		await this.register(type, value, additionalData);
	}

	/**
	 * Returns an object with the total stats for each type.
	 */
	async getTotalStats() {
		const totalStatsObj = {
			TOTAL_USERS: this.client.guilds.cache.reduce(
				(acc, guild) => acc + guild.memberCount,
				0,
			),
			TOTAL_GUILDS: this.client.guilds.cache.size,
			TOTAL_ACTIVE_USERS: await this.db.get(User).count(),
			TOTAL_COMMANDS: await this.statsRepo.count(allInteractions),
		};

		return totalStatsObj;
	}

	/**
	 * Get the last saved interaction.
	 */
	async getLastInteraction() {
		const lastInteraction = await this.statsRepo.findOne(allInteractions, {
			orderBy: { createdAt: 'DESC' },
		});

		return lastInteraction;
	}

	/**
	 * Get the last guild added to the database.
	 */
	async getLastGuildAdded() {
		const guilds = await this.db.get(Guild).find(
			{},
			{
				orderBy: { createdAt: 'DESC' },
			},
		);

		return guilds[0];
	}

	/**
	 * Get commands sorted by total amount of uses in DESC order.
	 */
	async getTopCommands() {
		if ('createQueryBuilder' in this.db.em) {
			const qb = this.db.em.createQueryBuilder(Stat);
			const query = qb
				.select(['type', 'value as name', 'count(*) as count'])
				.where(allInteractions)
				.groupBy(['type', 'value']);

			const slashCommands: StatPerInterval = await query.execute();

			return slashCommands.sort((a, b) => b.count - a.count);
		} else if ('aggregate' in this.db.em) {
			const slashCommands: StatPerInterval = await (
				this.db.em as keyof typeof this.db.em & {
					aggregate: (_: unknown, __: unknown) => Promise<StatPerInterval>;
				}
			).aggregate(Stat, [
				{
					$match: allInteractions,
				},
				{
					$group: {
						id: { type: '$type', value: '$value' },
						count: { $sum: 1 },
					},
				},
				{
					$replaceRoot: {
						newRoot: {
							$mergeObjects: ['$id', { count: '$count' }],
						},
					},
				},
			]);

			return slashCommands.sort((a, b) => b.count - a.count);
		} else {
			return [];
		}
	}

	/**
	 * Get the users activity per slice of interactions amount in percentage.
	 */
	async getUsersActivity() {
		const usersActivity = {
			'1-10': 0,
			'11-50': 0,
			'51-100': 0,
			'101-1000': 0,
			'>1000': 0,
		};

		const users = await this.db.get(User).findAll();

		for (const user of users) {
			const commandsCount = await this.db.get(Stat).count({
				...allInteractions,
				additionalData: {
					user: user.id,
				},
			});

			if (commandsCount <= 10) usersActivity['1-10']++;
			else if (commandsCount <= 50) usersActivity['11-50']++;
			else if (commandsCount <= 100) usersActivity['51-100']++;
			else if (commandsCount <= 1000) usersActivity['101-1000']++;
			else usersActivity['>1000']++;
		}

		return usersActivity;
	}

	/**
	 * Get guilds sorted by total amount of commands in DESC order.
	 */
	async getTopGuilds() {
		const topGuilds: {
			id: string;
			name: string;
			totalCommands: number;
		}[] = [];

		const guilds = await this.db.get(Guild).getActiveGuilds();

		for (const guild of guilds) {
			const discordGuild = await this.client.guilds
				.fetch(guild.id)
				.catch(() => null);
			if (!discordGuild) continue;

			const commandsCount = await this.db.get(Stat).count({
				...allInteractions,
				additionalData: {
					guild: guild.id,
				},
			});

			topGuilds.push({
				id: guild.id,
				name: discordGuild.name,
				totalCommands: commandsCount,
			});
		}

		return topGuilds.sort((a, b) => b.totalCommands - a.totalCommands);
	}

	/**
	 * Returns the amount of row for a given type per day in a given interval of days from now.
	 * @param type the type of the stat to retrieve
	 * @param days interval of days from now
	 */
	async countStatsPerDays(
		type: string,
		days: number,
	): Promise<StatPerInterval> {
		const stats: StatPerInterval = [];
		const now = dayjsTimezone();

		for (let i = 0; i < days; i++) {
			const date = now.subtract(i, 'day');
			const statsFound = await this.statsRepo.find({
				type,
				createdAt: {
					$gte: date.startOf('day').toDate(),
					$lte: date.endOf('day').toDate(),
				},
			});

			stats.push({
				date: formatDate(date, 'onlyDate'),
				count: statsFound.length,
			});
		}

		return this.cumulateStatPerInterval(stats);
	}

	/**
	 * Transform individual day stats into cumulated stats.
	 * @param stats
	 */
	cumulateStatPerInterval(stats: StatPerInterval): StatPerInterval {
		const cumulatedStats = stats
			.reverse()
			.reduce<StatPerInterval>((acc, stat, i) => {
				if (acc.length === 0) {
					acc.push(stat);
				} else {
					acc.push({
						date: stat.date,
						count: acc[i - 1]?.count ?? 0 + stat.count,
					});
				}

				return acc;
			}, [])
			.reverse();

		return cumulatedStats;
	}

	/**
	 * Sum two array of stats.
	 * @param stats1
	 * @param stats2
	 */
	sumStats(stats1: StatPerInterval, stats2: StatPerInterval): StatPerInterval {
		const allDays = [
			...new Set(stats1.concat(stats2).map((stat) => stat.date)),
		].sort((a, b) => {
			const aa = a.split('/').reverse().join();
			const bb = b.split('/').reverse().join();

			return aa < bb ? -1 : aa > bb ? 1 : 0;
		});

		const sumStats = allDays.map((day) => ({
			date: day,
			count:
				(stats1.find((stat) => stat.date === day)?.count ?? 0) +
				(stats2.find((stat) => stat.date === day)?.count ?? 0),
		}));

		return sumStats;
	}

	/**
	 * Get the current process usage (CPU, RAM, etc).
	 */
	async getPidUsage() {
		const pidUsage = await pidusage(process.pid);

		return {
			...pidUsage,
			cpu: pidUsage.cpu.toFixed(1),
			memory: {
				usedInMb: (pidUsage.memory / (1024 * 1024)).toFixed(1),
				percentage: ((pidUsage.memory / osu.mem.totalMem()) * 100).toFixed(1),
			},
		};
	}

	/**
	 * Get the current host health (CPU, RAM, etc).
	 */
	async getHostUsage() {
		return {
			cpu: await osu.cpu.usage(),
			memory: await osu.mem.info(),
			os: await osu.os.oos()(),
			uptime: osu.os.uptime(),
			hostname: osu.os.hostname(),
			platform: osu.os.platform(),
		};
	}

	/**
	 * Get latency from the discord websocket gate.
	 */
	getLatency() {
		return {
			ping: this.client.ws.ping,
		};
	}

	/**
	 * Run each day at 00:00 to update daily stats.
	 */
	@Schedule('0 0 * * *')
	async registerDailyStats() {
		const totalStats = await this.getTotalStats();

		for (const type of Object.keys(totalStats)) {
			const value = JSON.stringify(totalStats[type as keyof typeof totalStats]);
			await this.register(type, value);
		}
	}
}
