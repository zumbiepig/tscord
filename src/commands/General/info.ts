import { Category } from '@discordx/utilities';
import dayjs from 'dayjs/esm';
import relativeTime from 'dayjs/esm/plugin/relativeTime';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	type EmbedField,
} from 'discord.js';
import { Client, Discord } from 'discordx';
import { Guard } from 'discordx';

import { generalConfig } from '@/configs';
import { Stats } from '@/services';
import { Injectable, Slash } from '@/utils/decorators';
import { getColor, isValidUrl, timeAgo } from '@/utils/functions';
import { getPackageDotJson, getTscordVersion } from '@/utils/functions';

dayjs.extend(relativeTime);

const links = [
	...(generalConfig.links?.botInvite
		? [{ label: 'Invite me!', url: generalConfig.links.botInvite }]
		: []),
	...(generalConfig.links?.supportServer
		? [{ label: 'Support server', url: generalConfig.links.supportServer }]
		: []),
	...(generalConfig.links?.gitRepo
		? [{ label: 'GitHub', url: generalConfig.links.gitRepo }]
		: []),
];

@Discord()
@Injectable()
@Category('General')
export default class InfoCommand {
	constructor(private stats: Stats) {}

	@Slash({
		name: 'info',
	})
	@Guard()
	async info(interaction: CommandInteraction, client: Client) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: generalConfig.name,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setTitle(client.user?.tag ?? '')
			.setThumbnail(client.user?.displayAvatarURL() ?? '')
			.setColor(getColor('primary'))
			.setDescription(generalConfig.description);

		const fields: EmbedField[] = [];

		/**
		 * Owner field
		 */
		if (generalConfig.ownerId) {
			await client.users
				.fetch(generalConfig.ownerId)
				.then((owner) => {
					fields.push({
						name: 'Owner',
						value: `\`${owner.tag}\``,
						inline: true,
					});
				})
				.catch(() => null);
		}

		/**
		 * Uptime field
		 */
		if (client.uptime) {
			fields.push({
				name: 'Uptime',
				value: timeAgo(new Date(Date.now() - client.uptime)),
				inline: true,
			});
		}

		/**
		 * Totals field
		 */
		const totalStats = await this.stats.getTotalStats();
		fields.push({
			name: 'Totals',
			value: `**${totalStats.TOTAL_GUILDS.toString()}** guilds\n**${totalStats.TOTAL_USERS.toString()}** users\n**${totalStats.TOTAL_COMMANDS.toString()}** commands`,
			inline: true,
		});

		/**
		 * Framework/template field
		 */
		fields.push({
			name: 'Framework/template',
			value: `[TSCord](https://github.com/barthofu/tscord) (v${getTscordVersion()})`,
			inline: true,
		});

		/**
		 * Libraries field
		 */
		fields.push({
			name: 'Libraries',
			value: `[discord.js](https://discord.js.org/) (v${(getPackageDotJson() as { dependencies: Record<string, string> }).dependencies['discord.js']?.replace(/[><=~^]/g, '') ?? ''})\n[discordx](https://discordx.js.org/) (v${(getPackageDotJson() as { dependencies: Record<string, string> }).dependencies['discordx']?.replace(/[><=~^]/g, '') ?? ''})`,
			inline: true,
		});

		// add the fields to the embed
		embed.addFields(fields);

		/**
		 * Define links buttons
		 */
		const buttons = links
			.map((link) => {
				const url = link.url.split('_').join('');
				if (isValidUrl(url)) {
					return new ButtonBuilder()
						.setLabel(link.label)
						.setURL(url)
						.setStyle(ButtonStyle.Link);
				} else {
					return null;
				}
			})
			.filter((link) => link) as ButtonBuilder[];
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);

		// finally send the embed
		await interaction.followUp({
			embeds: [embed],
			components: [row],
		});
	}
}
