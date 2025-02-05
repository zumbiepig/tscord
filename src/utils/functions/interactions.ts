import { SimpleCommandMessage } from 'discordx';

import type { AllInteractions } from '@/utils/types';

/**
 * Abstraction level to reply to either a slash command or a simple command message.
 * @param interaction
 * @param message
 */
export async function replyToInteraction(
	interaction: AllInteractions,
	message: string | Record<string, unknown>,
	editMessage = true,
) {
	if (interaction instanceof SimpleCommandMessage) {
		return await interaction.message.reply(message);
	} else if (editMessage) {
		return await interaction.editReply(message);
	} else {
		return await interaction.followUp(message);
	}
}
