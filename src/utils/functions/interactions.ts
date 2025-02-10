import { constantCase } from 'change-case';
import {
	AutocompleteInteraction,
	type BaseMessageOptions,
	type BaseMessageOptionsWithPoll,
	ButtonInteraction,
	ChannelSelectMenuInteraction,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	type Interaction,
	type InteractionReplyOptions,
	MentionableSelectMenuInteraction,
	MessagePayload,
	type MessageReplyOptions,
	ModalSubmitInteraction,
	type RepliableInteraction,
	RoleSelectMenuInteraction,
	StringSelectMenuInteraction,
	UserSelectMenuInteraction,
} from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export function getTypeOfInteraction(
	interaction: Interaction | SimpleCommandMessage,
) {
	if (interaction instanceof ChatInputCommandInteraction) {
		return 'CHAT_INPUT_COMMAND_INTERACTION';
	} else if (interaction instanceof ContextMenuCommandInteraction) {
		return 'CONTEXT_MENU_COMMAND_INTERACTION';
	} else if (interaction instanceof AutocompleteInteraction) {
		return 'AUTOCOMPLETE_INTERACTION';
	} else if (
		interaction instanceof StringSelectMenuInteraction ||
		interaction instanceof UserSelectMenuInteraction ||
		interaction instanceof RoleSelectMenuInteraction ||
		interaction instanceof MentionableSelectMenuInteraction ||
		interaction instanceof ChannelSelectMenuInteraction
	) {
		return 'SELECT_MENU_INTERACTION';
	} else if (interaction instanceof ButtonInteraction) {
		return 'BUTTON_INTERACTION';
	} else if (interaction instanceof ModalSubmitInteraction) {
		return 'MODAL_SUBMIT_INTERACTION';
	} else if (interaction instanceof SimpleCommandMessage) {
		return 'SIMPLE_COMMAND_MESSAGE';
	} else {
		throw new Error(
			'Unknown interaction type: ' +
				constantCase((interaction as object).constructor.name),
		);
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
	message: string | MessagePayload | BaseMessageOptionsWithPoll,
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
