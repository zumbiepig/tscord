import { Category } from '@discordx/utilities';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Guard } from 'discordx';

import { generalConfig } from '@/configs';
import { Slash } from '@/utils/decorators';
import { getColor } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

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
