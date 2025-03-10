import os from 'node:os';
import process from 'node:process';

import type { SqlEntityManager } from '@mikro-orm/better-sqlite';
import type { FilterQuery } from '@mikro-orm/core';
import type { MongoEntityManager } from '@mikro-orm/mongodb';
import type { Interaction, Snowflake } from 'discord.js';
import { Client, SimpleCommandMessage } from 'discordx';
import { delay, inject } from 'tsyringe';

import { Guild, Stat, StatRepository, User } from '@/entities';
import { Database } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	dayjsTimezone,
	getHostCPUUsage,
	getProcessCPUUsage,
	getTypeOfInteraction,
	resolveAction,
	resolveChannel,
	resolveGuild,
	resolveUser,
} from '@/utils/functions';
import type { StatAdditionalData, StatPerInterval, StatType } from '@/utils/types';

const allInteractions = {
	type: {
		$in: [
			'CHAT_INPUT_COMMAND_INTERACTION',
			'SIMPLE_COMMAND_MESSAGE',
			'USER_CONTEXT_MENU_COMMAND_INTERACTION',
			'MESSAGE_CONTEXT_MENU_COMMAND_INTERACTION',
		],
	},
} satisfies FilterQuery<Stat>;

@Service()
export class Stats {
	private statsRepo: StatRepository;

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
	 * @param additionalData
	 */
	register(type: StatType, value: string, additionalData?: StatAdditionalData) {
		this.db.em.create(Stat, { type, value, additionalData });
	}

	/**
	 * Record an interaction and add it to the database.
	 * @param interaction
	 */
	registerInteraction(interaction: Interaction | SimpleCommandMessage) {
		// we extract data from the interaction
		const type = getTypeOfInteraction(interaction);
		const value = resolveAction(interaction);
		const additionalData = {
			user: resolveUser(interaction).id,
			guild: resolveGuild(interaction)?.id,
			channel: resolveChannel(interaction)?.id,
		};

		// add it to the db
		this.register(type, value, additionalData);
	}

	/**
	 * Returns an object with the total stats for each type.
	 */
	async getTotalStats() {
		const totalStatsObject = {
			TOTAL_USERS: this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
			TOTAL_GUILDS: this.client.guilds.cache.size,
			TOTAL_ACTIVE_USERS: await this.db.get(User).count({ active: true }),
			TOTAL_COMMANDS: await this.statsRepo.count(allInteractions),
		};

		return totalStatsObject;
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
		const guild = await this.db.em.findOne(
			Guild,
			{},
			{
				orderBy: { createdAt: 'DESC' },
			},
		);

		return guild;
	}

	/**
	 * Get commands sorted by total amount of uses in DESC order.
	 */
	async getTopCommands(): Promise<StatPerInterval> {
		if ('createQueryBuilder' in this.db.em) {
			const qb = (this.db.em as SqlEntityManager).createQueryBuilder(Stat);
			const query = qb
				.select(['type', 'value as name', 'count(*) as count'])
				.where(allInteractions)
				.groupBy(['type', 'value']);

			const slashCommands = await query.execute();

			return slashCommands.sort((a, b) => b.count - a.count);
		} else if ('aggregate' in this.db.em) {
			const slashCommands = (await (this.db.em as MongoEntityManager).aggregate(Stat, [
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
			])) as StatPerInterval;
			return slashCommands.sort((a, b) => b.count - a.count);
		} else {
			const stats = await this.db.em.find(Stat, allInteractions, {});

			// Transform results to group by date, type, and value
			const groupedResults = stats.reduce<Record<string, { date: string; type: string; name: string; count: number }>>(
				(acc, stat) => {
					const date = dayjsTimezone(stat.createdAt).format('YYYY-MM-DD');
					const key = `${date}_${stat.type}_${stat.value}`;

					if (!acc[key]) {
						acc[key] = { date: date, type: stat.type, name: stat.value, count: 0 };
					}

					acc[key].count += 1;
					return acc;
				},
				{},
			);

			// Convert object map to an array
			const results = Object.values(groupedResults);

			// Sort commands by count in descending order
			return results.sort((a, b) => b.count - a.count);
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
			id: Snowflake;
			name: string;
			totalCommands: number;
		}[] = [];

		const guilds = await this.db.get(Guild).getActive();

		for (const guild of guilds) {
			const discordGuild = await this.client.guilds.fetch(guild.id).catch(() => void 0);
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
	async countStatsPerDays(type: StatType, days: number): Promise<StatPerInterval> {
		const stats: StatPerInterval = [];
		const now = dayjsTimezone();

		for (let i = 0; i < days; i++) {
			const date = now.subtract(i, 'day').toDate();
			const statCount = await this.getCountForGivenDay(type, date);

			stats.push({
				date: date,
				count: statCount,
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
	 * Sum an array of stats.
	 * @param args An list of stats to sum
	 */
	sumStats(...args: StatPerInterval[]): StatPerInterval {
		return args.reduce((stats1, stats2) => {
			const allDays = [...new Set(stats1.concat(stats2).map((stat) => stat.date))].sort((a, b) => {
				const msInDay = 1000 * 60 * 60 * 24;
				return Math.ceil(a.getTime() / msInDay) * msInDay - Math.ceil(b.getTime() / msInDay) * msInDay;
			});

			const sumStats = allDays.map((day) => ({
				date: day,
				count:
					(stats1.find((stat) => stat.date === day)?.count ?? 0) +
					(stats2.find((stat) => stat.date === day)?.count ?? 0),
			}));

			return sumStats;
		});
	}

	/**
	 * Returns the total count of row for a given type at a given day.
	 * @param type
	 * @param date - day to get the stats for (any time of the day will work as it extract the very beginning and the very ending of the day as the two limits)
	 */
	async getCountForGivenDay(type: StatType, date: Date): Promise<number> {
		const start = dayjsTimezone(date).startOf('day').toDate();
		const end = dayjsTimezone(date).endOf('day').toDate();

		const stats = await this.statsRepo.find({
			type,
			createdAt: {
				$gte: start,
				$lte: end,
			},
		});

		return stats.length;
	}

	/**
	 * Get the current process usage (CPU, RAM, etc).
	 */
	async getPidUsage() {
		const usedMemory = process.memoryUsage().heapUsed;

		return {
			pid: process.pid,
			ppid: process.ppid,
			cpu: (await getProcessCPUUsage()).toFixed(1),
			memory: {
				usedInMb: usedMemory / (1024 * 1024),
				percentage: ((usedMemory / os.totalmem()) * 100).toFixed(1),
			},
		};
	}

	/**
	 * Get the current host health (CPU, RAM, etc).
	 */
	async getHostUsage() {
		return {
			cpu: (await getHostCPUUsage()).toFixed(1),
			memory: os.totalmem() - os.freemem(),
			os: os.type() + os.release(),
			uptime: os.uptime(),
			hostname: os.hostname(),
			platform: process.platform,
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
			this.register(type as keyof typeof totalStats, value);
		}
	}
}
