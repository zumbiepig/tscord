import { Category } from '@discordx/utilities';
import { EmbedBuilder, type RepliableInteraction } from 'discord.js';
import { Discord } from 'discordx';

import { colorsConfig, generalConfig } from '@/configs';
import { Slash } from '@/utils/decorators';
import { replyToInteraction } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

@Discord()
@Category('General')
export default class InviteCommand {
	@Slash({
		name: 'invite',
	})
	async invite(interaction: RepliableInteraction, { translations }: InteractionData) {
		const embed = new EmbedBuilder()
			.setTitle(translations.COMMANDS.INVITE.EMBED.TITLE())
			.setDescription(
				translations.COMMANDS.INVITE.EMBED.DESCRIPTION({
					link: generalConfig.links.botInvite ?? '',
				}),
			)
			.setColor(colorsConfig.basicEmbeds.primary);

		await replyToInteraction(interaction, {
			embeds: [embed],
		});
	}
}
