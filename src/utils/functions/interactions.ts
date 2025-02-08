import type { RepliableInteraction } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export function getTypeOfInteraction(
	interaction: object,
): (typeof interaction)['constructor']['name'] {
	return interaction.constructor.name;
}

/**
 * Abstraction level to reply to either a slash command or a simple command message.
 * @param interaction The interaction to reply to.
 * @param message The message to reply with.
 * @param editMessage Whether to edit the message or reply to the interaction.
 */
export async function replyToInteraction(
	interaction: RepliableInteraction | SimpleCommandMessage,
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
