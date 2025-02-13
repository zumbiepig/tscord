import { Controller, Get, QueryParams, UseBefore } from '@tsed/common';

import { DevAuthenticated } from '@/api/middlewares';
import { Stats } from '@/services';
import { BaseController } from '@/utils/classes';


@Controller('/stats')
@UseBefore(DevAuthenticated)
@injectable()
export class StatsController extends BaseController {
	constructor(private stats: Stats) {
		super();
	}

	@Get('/totals')
	async info() {
		const totalStats = await this.stats.getTotalStats();

		return {
			stats: {
				totalUsers: totalStats.TOTAL_USERS,
				totalGuilds: totalStats.TOTAL_GUILDS,
				totalActiveUsers: totalStats.TOTAL_ACTIVE_USERS,
				totalCommands: totalStats.TOTAL_COMMANDS,
			},
		};
	}

	@Get('/interaction/last')
	async lastInteraction() {
		return await this.stats.getLastInteraction();
	}

	@Get('/guilds/last')
	async lastGuildAdded() {
		return await this.stats.getLastGuildAdded();
	}

	@Get('/commands/usage')
	async commandsUsage(@QueryParams('numberOfDays') numberOfDays = 7) {
		const commandsUsage = {
			slashCommands: await this.stats.countStatsPerDays(
				'CHAT_INPUT_COMMAND_INTERACTION',
				numberOfDays,
			),
			simpleCommands: await this.stats.countStatsPerDays(
				'SIMPLE_COMMAND_MESSAGE',
				numberOfDays,
			),
			userContextMenus: await this.stats.countStatsPerDays(
				'USER_CONTEXT_MENU_COMMAND_INTERACTION',
				numberOfDays,
			),
			messageContextMenus: await this.stats.countStatsPerDays(
				'MESSAGE_CONTEXT_MENU_COMMAND_INTERACTION',
				numberOfDays,
			),
		};

		const body = [];
		for (let i = 0; i < numberOfDays; i++) {
			body.push({
				date: commandsUsage.slashCommands[i]?.date,
				slashCommands: commandsUsage.slashCommands[i]?.count,
				simpleCommands: commandsUsage.simpleCommands[i]?.count,
				contextMenus:
					(commandsUsage.messageContextMenus[i]?.count ?? 0) +
					(commandsUsage.userContextMenus[i]?.count ?? 0),
			});
		}

		return body;
	}

	@Get('/commands/top')
	async topCommands() {
		return await this.stats.getTopCommands();
	}

	@Get('/users/activity')
	async usersActivity() {
		return await this.stats.getUsersActivity();
	}

	@Get('/guilds/top')
	async topGuilds() {
		return await this.stats.getTopGuilds();
	}

	@Get('/usersAndGuilds')
	async usersAndGuilds(@QueryParams('numberOfDays') numberOfDays = 7) {
		return {
			activeUsers: await this.stats.countStatsPerDays(
				'TOTAL_ACTIVE_USERS',
				numberOfDays,
			),
			users: await this.stats.countStatsPerDays('TOTAL_USERS', numberOfDays),
			guilds: await this.stats.countStatsPerDays('TOTAL_GUILDS', numberOfDays),
		};
	}
}
