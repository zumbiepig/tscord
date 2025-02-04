import { CommandInteraction, EmbedBuilder } from 'discord.js';

import { colorsConfig } from '@/configs';
import { replyToInteraction } from '@/utils/functions';

/**
 * Send a simple success embed
 * @param interaction - discord interaction
 * @param message - message to log
 */
export async function simpleSuccessEmbed(
	interaction: CommandInteraction,
	message: string,
) {
	const embed = new EmbedBuilder()
		.setColor(colorsConfig.success)
		.setTitle(`✅ ${message}`);

	await replyToInteraction(interaction, { embeds: [embed] });
}

/**
 * Send a simple error embed
 * @param interaction - discord interaction
 * @param message - message to log
 */
export async function simpleErrorEmbed(
	interaction: CommandInteraction,
	message: string,
) {
	const embed = new EmbedBuilder()
		.setColor(colorsConfig.error)
		.setTitle(`❌ ${message}`);

	await replyToInteraction(interaction, { embeds: [embed] });
}
