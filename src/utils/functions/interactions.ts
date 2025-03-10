import { constantCase } from 'change-case';
import {
	type ApplicationCommandOptionChoiceData,
	AutocompleteInteraction,
	type BaseMessageOptionsWithPoll,
	ButtonInteraction,
	ChannelSelectMenuInteraction,
	ChatInputCommandInteraction,
	type Interaction,
	type InteractionEditReplyOptions,
	type InteractionReplyOptions,
	MentionableSelectMenuInteraction,
	Message,
	MessageContextMenuCommandInteraction,
	MessagePayload,
	type MessageReplyOptions,
	ModalSubmitInteraction,
	type RepliableInteraction,
	RoleSelectMenuInteraction,
	StringSelectMenuInteraction,
	UserContextMenuCommandInteraction,
	UserSelectMenuInteraction,
} from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export function getTypeOfInteraction(interaction: Interaction | SimpleCommandMessage) {
	if (interaction instanceof ChatInputCommandInteraction) {
		return 'CHAT_INPUT_COMMAND_INTERACTION';
	} else if (interaction instanceof UserContextMenuCommandInteraction) {
		return 'USER_CONTEXT_MENU_COMMAND_INTERACTION';
	} else if (interaction instanceof MessageContextMenuCommandInteraction) {
		return 'MESSAGE_CONTEXT_MENU_COMMAND_INTERACTION';
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
	interaction: RepliableInteraction,
	message: string | MessagePayload | InteractionEditReplyOptions,
	editMessage: true,
): Promise<Message>;
export async function replyToInteraction(
	interaction: RepliableInteraction,
	message: string | MessagePayload | InteractionReplyOptions,
	editMessage: false,
): Promise<Message>;
export async function replyToInteraction(
	interaction: SimpleCommandMessage | Message,
	message: string | MessagePayload | MessageReplyOptions,
): Promise<Message>;
export async function replyToInteraction(
	interaction: RepliableInteraction | SimpleCommandMessage | Message,
	message: string | MessagePayload | BaseMessageOptionsWithPoll,
	editMessage?: boolean,
): Promise<Message>;
export async function replyToInteraction(
	interaction: AutocompleteInteraction,
	message: string | ApplicationCommandOptionChoiceData[],
): Promise<undefined>;
export async function replyToInteraction(
	interaction: Interaction | SimpleCommandMessage | Message,
	message: string,
	editMessage?: boolean,
): Promise<Message | undefined>;
export async function replyToInteraction(
	interaction: Interaction | SimpleCommandMessage | Message,
	message:
		| string
		| MessagePayload
		| InteractionReplyOptions
		| InteractionEditReplyOptions
		| MessageReplyOptions
		| BaseMessageOptionsWithPoll
		| ApplicationCommandOptionChoiceData[],
	editMessage = true,
) {
	if (interaction instanceof SimpleCommandMessage) {
		return await interaction.message.reply(message as string | MessagePayload | MessageReplyOptions);
	} else if (interaction instanceof Message) {
		return await interaction.reply(message as string | MessagePayload | MessageReplyOptions);
	} else if (interaction instanceof AutocompleteInteraction) {
		await interaction.respond(
			Array.isArray(message) ? message : [{ name: message as string, value: message as string }],
		);
		return;
	} else if (editMessage) {
		return await interaction.editReply(message as string | MessagePayload | InteractionEditReplyOptions);
	} else {
		return await interaction.followUp(message as string | MessagePayload | InteractionReplyOptions);
	}
}

export async function replyToAutocompleteInteraction(
	interaction: AutocompleteInteraction,
	options: ApplicationCommandOptionChoiceData[],
) {
	await interaction.respond(options);
}
