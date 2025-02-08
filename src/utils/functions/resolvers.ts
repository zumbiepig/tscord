import {
	type APIInteractionGuildMember,
	AutocompleteInteraction,
	Base,
	BaseInteraction,
	type Channel,
	ChatInputCommandInteraction,
	CommandInteraction,
	ContextMenuCommandInteraction,
	Guild,
	GuildMember,
	type Interaction,
	Message,
	MessageComponentInteraction,
	MessageReaction,
	ModalSubmitInteraction,
	type TextBasedChannel,
	User,
	VoiceState,
} from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export function resolveUser(
	interaction:
		| Interaction
		| SimpleCommandMessage
		| Message
		| VoiceState
		| MessageReaction,
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
		| Interaction
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
	interaction: Interaction | SimpleCommandMessage,
): Guild | null {
	return interaction instanceof BaseInteraction
		? interaction.guild
		: interaction instanceof SimpleCommandMessage
			? interaction.message.guild
			: (null as never);
}

export function resolveChannel(
	interaction: Interaction | SimpleCommandMessage,
): TextBasedChannel | null {
	return interaction instanceof BaseInteraction
		? interaction.channel
		: interaction instanceof SimpleCommandMessage
			? interaction.message.channel
			: (null as never);
}

export function resolveCommandName(
	interaction:
		| CommandInteraction
		| AutocompleteInteraction
		| SimpleCommandMessage,
): string {
	return interaction instanceof CommandInteraction ||
		interaction instanceof AutocompleteInteraction
		? interaction.commandName
		: interaction instanceof SimpleCommandMessage
			? interaction.name
			: (null as never);
}

export function resolveAction(interaction: Interaction | SimpleCommandMessage) {
	return interaction instanceof ChatInputCommandInteraction
		? `${interaction.commandName} ${interaction.options.getSubcommandGroup(false) ?? ''} ${interaction.options.getSubcommand(false) ?? ''}`.trimEnd()
		: interaction instanceof CommandInteraction ||
			  interaction instanceof AutocompleteInteraction
			? interaction.commandName
			: interaction instanceof MessageComponentInteraction ||
				  interaction instanceof ModalSubmitInteraction
				? interaction.customId
				: interaction instanceof SimpleCommandMessage
					? interaction.name
					: (null as never);
}

export function resolveLocale(interaction: Interaction | SimpleCommandMessage) {
	return interaction instanceof BaseInteraction
		? interaction.locale
		: interaction instanceof SimpleCommandMessage
			? (interaction.message.guild?.preferredLocale ?? null)
			: (null as never);
}
