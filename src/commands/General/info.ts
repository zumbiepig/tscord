import { Category } from '@discordx/utilities';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	type EmbedField,
} from 'discord.js';
import { Client, Discord } from 'discordx';
import { injectable } from 'tsyringe';

import { colorsConfig, generalConfig } from '@/configs';
import { Stats } from '@/services';
import { Slash } from '@/utils/decorators';
import { dayjsTimezone, isValidUrl } from '@/utils/functions';
import { getPackageJson, getTscordVersion } from '@/utils/functions';

const links = [
	...(generalConfig.links.botInvite
		? [{ label: 'Invite me!', url: generalConfig.links.botInvite }]
		: []),
	...(generalConfig.links.supportServer
		? [{ label: 'Support server', url: generalConfig.links.supportServer }]
		: []),
	...(generalConfig.links.gitRepo
		? [{ label: 'GitHub', url: generalConfig.links.gitRepo }]
		: []),
];

@Discord()
@injectable()
@Category('General')
export default class InfoCommand {
	constructor(private stats: Stats) {}

	@Slash({
		name: 'info',
	})
	async info(interaction: CommandInteraction, client: Client) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: generalConfig.name,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setTitle(client.user?.tag ?? '')
			.setThumbnail(client.user?.displayAvatarURL() ?? '')
			.setColor(colorsConfig.basicEmbeds.primary)
			.setDescription(generalConfig.description);

		const fields: EmbedField[] = [];

		/**
		 * Owner field
		 */
		if (generalConfig.ownerId) {
			const owner = await client.users
				.fetch(generalConfig.ownerId)
				.catch(() => void 0);
			if (owner)
				fields.push({
					name: 'Owner',
					value: `\`${owner.tag}\``,
					inline: true,
				});
		}

		/**
		 * Uptime field
		 */
		if (client.uptime) {
			fields.push({
				name: 'Uptime',
				value: dayjsTimezone().subtract(client.uptime).fromNow(true),
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
			value: `[discord.js](https://discord.js.org/) (v${getPackageJson().dependencies?.['discord.js']?.replace(/[<=>^~]/g, '') ?? ''})\n[discordx](https://discordx.js.org/) (v${getPackageJson().dependencies?.['discordx']?.replace(/[<=>^~]/g, '') ?? ''})`,
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
				return isValidUrl(url)
					? new ButtonBuilder()
							.setLabel(link.label)
							.setURL(url)
							.setStyle(ButtonStyle.Link)
					: undefined;
			})
			.filter(Boolean) as ButtonBuilder[];
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);

		// finally send the embed
		await interaction.followUp({
			embeds: [embed],
			components: [row],
		});
	}
}
