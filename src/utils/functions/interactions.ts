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
) {
	if (interaction instanceof SimpleCommandMessage) {
		await interaction.message.reply(message);
	} else {
		await interaction.followUp(message);
	}
}
