import { constantCase } from 'change-case';
import {
	type ApplicationCommandOptionChoiceData,
	AutocompleteInteraction,
	type BaseMessageOptions,
	type BaseMessageOptionsWithPoll,
	type Interaction,
	type InteractionEditReplyOptions,
	type InteractionReplyOptions,
	Message,
	MessagePayload,
	type MessageReplyOptions,
	type RepliableInteraction,
} from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export function getTypeOfInteraction(interaction: Interaction | SimpleCommandMessage) {
	if (interaction instanceof SimpleCommandMessage) {
		return 'SIMPLE_COMMAND_MESSAGE';
	} else if (interaction.isChatInputCommand()) {
		return 'CHAT_INPUT_COMMAND_INTERACTION';
	} else if (interaction.isContextMenuCommand()) {
		return 'CONTEXT_MENU_COMMAND_INTERACTION';
	} else if (interaction.isAnySelectMenu()) {
		return 'ANY_SELECT_MENU_INTERACTION';
	} else if (interaction.isButton()) {
		return 'BUTTON_INTERACTION';
	} else if (interaction.isAutocomplete()) {
		return 'AUTOCOMPLETE_INTERACTION';
	} else if (interaction.isModalSubmit()) {
		return 'MODAL_SUBMIT_INTERACTION';
	} else {
		throw new TypeError('Unknown interaction type: ' + constantCase((interaction as object).constructor.name));
	}
}

/**
 * Abstraction level to reply to either a slash command or a simple command message.
 * @param interaction The interaction to reply to.
 * @param message The message to reply with.
 * @param editMessage Whether to edit the original reply or send a new reply.
 */
export async function replyToInteraction(
	interaction: RepliableInteraction | SimpleCommandMessage,
	message:
		| string
		| MessagePayload
		| InteractionReplyOptions
		| InteractionEditReplyOptions
		| MessageReplyOptions
		| BaseMessageOptions,
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

export async function replyToAutocompleteInteraction(
	interaction: AutocompleteInteraction,
	options: ApplicationCommandOptionChoiceData[],
) {
	await interaction.respond(options);
}
