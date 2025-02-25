import { Pagination, type PaginationItem } from '@discordx/pagination';
import { Category } from '@discordx/utilities';
import ChartJsImage from 'chartjs-to-image';
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	EmbedBuilder,
} from 'discord.js';
import { Discord, SimpleCommandMessage } from 'discordx';
import { injectable } from 'tsyringe';

import { colorsConfig } from '@/configs';
import { Stats } from '@/services';
import { Slash, SlashOption } from '@/utils/decorators';
import { formatDate, resolveUser } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

@Discord()
@injectable()
@Category('General')
export default class StatsCommand {
	private statsResolver = {
		USERS: async (days: number) =>
			await this.stats.countStatsPerDays('TOTAL_USERS', days),
		GUILDS: async (days: number) =>
			await this.stats.countStatsPerDays('TOTAL_GUILDS', days),
		ACTIVE_USERS: async (days: number) =>
			await this.stats.countStatsPerDays('TOTAL_ACTIVE_USERS', days),
		COMMANDS: async (days: number) =>
			this.stats.sumStats(
				...(await Promise.all(
					(
						[
							'CHAT_INPUT_COMMAND_INTERACTION',
							'SIMPLE_COMMAND_MESSAGE',
							'USER_CONTEXT_MENU_COMMAND_INTERACTION',
							'MESSAGE_CONTEXT_MENU_COMMAND_INTERACTION',
						] as const
					).map((type) => this.stats.countStatsPerDays(type, days)),
				)),
			),
	};

	constructor(private stats: Stats) {}

	@Slash({
		name: 'stats',
	})
	async statsHandler(
		@SlashOption({
			name: 'days',
			type: ApplicationCommandOptionType.Number,
			minValue: 1,
		})
		days = 7,
		interaction: CommandInteraction | SimpleCommandMessage,
		{ localize }: InteractionData,
	) {
		const pages: PaginationItem[] = [];

		for (const resolver of Object.entries(this.statsResolver)) {
			const stats = await resolver[1](days);

			const chart = new ChartJsImage().setConfig({
				type: 'line',
				data: {
					labels: stats.map((stat) =>
						formatDate(stat.date, 'onlyDayMonth'),
					),
					datasets: [
						{
							label: '',
							data: stats.map((stat) => stat.count),
							fill: true,
							backgroundColor: 'rgba(252,231,3,0.1)',
							borderColor: 'rgb(252,186,3)',
							borderCapStyle: 'round',
							lineTension: 0.3,
						},
					],
				},
				options: {
					title: {
						display: true,
						text: localize.COMMANDS.STATS.HEADERS[
							resolver[0] as keyof typeof this.statsResolver
						](),
						fontColor: 'rgba(255,255,254,0.6)',
						fontSize: 20,
						padding: 15,
					},
					legend: { display: false },
					scales: {
						xAxes: [{ ticks: { fontColor: 'rgba(255,255,254,0.6)' } }],
						yAxes: [
							{
								ticks: {
									fontColor: 'rgba(255,255,254,0.6)',
									beginAtZero: false,
									stepSize: 1,
								},
							},
						],
					},
				},
			});

			const user = resolveUser(interaction);
			pages.push({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: user.username,
							iconURL: user.displayAvatarURL(),
						})
						.setColor(colorsConfig.primary)
						.setImage(chart.getUrl()),
				],
			});
		}

		await new Pagination(
			interaction instanceof SimpleCommandMessage
				? interaction.message
				: interaction,
			pages,
		).send();
	}
}
