import { Category } from '@discordx/utilities';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Guard } from 'discordx';

import { colorsConfig, generalConfig } from '@/configs';
import { L } from '@/i18n';
import { Slash } from '@/utils/decorators';
import type { InteractionData } from '@/utils/types';

@Discord()
@Category('General')
export default class InviteCommand {
	@Slash({
		name: 'invite',
	})
	@Guard()
	async invite(interaction: CommandInteraction, { interactionLocale }: InteractionData) {
		const embed = new EmbedBuilder()
			.setTitle(L[interactionLocale].COMMANDS.INVITE.EMBED.TITLE())
			.setDescription(
				L[interactionLocale].COMMANDS.INVITE.EMBED.DESCRIPTION({
					link: generalConfig.links.botInvite,
				}),
			)
			.setColor(colorsConfig.primary)
			.setFooter({ text: 'Powered by DiscBot Team ❤' });

		await interaction.followUp({
			embeds: [embed],
		});
	}
}
