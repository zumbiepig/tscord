import { Category } from '@discordx/utilities';
import { CommandInteraction, EmbedBuilder } from 'discord.js';

import { generalConfig } from '@/configs';
import { Discord, Slash } from '@/decorators';
import { Guard } from '@/guards';
import { getColor } from '@/utils/functions';

import type { InteractionData } from '../../utils/types/interactions';

@Discord()
@Category('General')
export default class InviteCommand {
	@Slash({
		name: 'invite',
	})
	@Guard()
	async invite(interaction: CommandInteraction, { localize }: InteractionData) {
		const embed = new EmbedBuilder()
			.setTitle(localize.COMMANDS.INVITE.EMBED.TITLE())
			.setDescription(
				localize.COMMANDS.INVITE.EMBED.DESCRIPTION({
					link: generalConfig.links?.botInvite,
				}),
			)
			.setColor(getColor('primary'))
			.setFooter({ text: 'Powered by DiscBot Team ❤' });

		await interaction.followUp({
			embeds: [embed],
		});
	}
}
