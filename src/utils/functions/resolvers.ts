import {
	type APIInteractionGuildMember,
	AutocompleteInteraction,
	BaseInteraction,
	CommandInteraction,
	Guild,
	GuildMember,
	Locale,
	Message,
	MessageComponentInteraction,
	MessageReaction,
	ModalSubmitInteraction,
	type PartialMessageReaction,
	type TextBasedChannel,
	User,
	VoiceState,
} from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export function resolveUser(
	interaction: BaseInteraction | SimpleCommandMessage | Message,
): User;
export function resolveUser(
	interaction:
		| BaseInteraction
		| SimpleCommandMessage
		| Message
		| VoiceState
		| MessageReaction
		| PartialMessageReaction,
): User | null;
export function resolveUser(
	interaction:
		| BaseInteraction
		| SimpleCommandMessage
		| Message
		| VoiceState
		| MessageReaction
		| PartialMessageReaction,
): User | null {
	return interaction instanceof BaseInteraction
		? interaction.user
		: interaction instanceof SimpleCommandMessage ||
			  interaction instanceof MessageReaction
			? interaction.message.author
			: interaction instanceof Message
				? interaction.author
				: interaction instanceof VoiceState
					? (interaction.member?.user ?? null)
					: (null as never);
}

export function resolveMember(
	interaction:
		| BaseInteraction
		| SimpleCommandMessage
		| Message
		| VoiceState
		| MessageReaction,
): GuildMember | APIInteractionGuildMember | null;
export function resolveMember(
	interaction: SimpleCommandMessage | Message | VoiceState | MessageReaction,
): GuildMember | null;
export function resolveMember(
	interaction:
		| BaseInteraction
		| SimpleCommandMessage
		| Message
		| VoiceState
		| MessageReaction,
): GuildMember | APIInteractionGuildMember | null {
	return interaction instanceof BaseInteraction ||
		interaction instanceof Message ||
		interaction instanceof VoiceState
		? interaction.member
		: interaction instanceof SimpleCommandMessage ||
			  interaction instanceof MessageReaction
			? interaction.message.member
			: (null as never);
}

export function resolveGuild(
	interaction: BaseInteraction | SimpleCommandMessage,
): Guild | null {
	return interaction instanceof BaseInteraction
		? interaction.guild
		: interaction instanceof SimpleCommandMessage
			? interaction.message.guild
			: (null as never);
}

export function resolveChannel(
	interaction: SimpleCommandMessage,
): TextBasedChannel;
export function resolveChannel(
	interaction: BaseInteraction | SimpleCommandMessage,
): TextBasedChannel | null;
export function resolveChannel(
	interaction: BaseInteraction | SimpleCommandMessage,
): TextBasedChannel | null {
	return interaction instanceof BaseInteraction
		? interaction.channel
		: interaction instanceof SimpleCommandMessage
			? interaction.message.channel
			: (null as never);
}

export function resolveAction(
	interaction: BaseInteraction | SimpleCommandMessage,
): string {
	return interaction instanceof CommandInteraction ||
		interaction instanceof AutocompleteInteraction
		? interaction.commandName
		: interaction instanceof MessageComponentInteraction ||
			  interaction instanceof ModalSubmitInteraction
			? interaction.customId
			: interaction instanceof SimpleCommandMessage
				? interaction.name
				: (null as never);
}

export function resolveLocale(interaction: BaseInteraction): Locale;
export function resolveLocale(
	interaction: BaseInteraction | SimpleCommandMessage,
): Locale | null;
export function resolveLocale(
	interaction: BaseInteraction | SimpleCommandMessage,
): Locale | null {
	return interaction instanceof BaseInteraction
		? interaction.locale
		: interaction instanceof SimpleCommandMessage
			? (interaction.message.guild?.preferredLocale ?? null)
			: (null as never);
}
