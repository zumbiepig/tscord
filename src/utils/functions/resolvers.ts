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
	type TextBasedChannel,
	User,
	type VoiceBasedChannel,
	VoiceState,
} from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export function resolveUser(interaction: BaseInteraction | SimpleCommandMessage | Message): User;
export function resolveUser(
	interaction: BaseInteraction | SimpleCommandMessage | Message | VoiceState | MessageReaction,
): User | undefined;
export function resolveUser(
	interaction: BaseInteraction | SimpleCommandMessage | Message | VoiceState | MessageReaction,
): User | undefined {
	return interaction instanceof BaseInteraction
		? interaction.user
		: interaction instanceof SimpleCommandMessage || interaction instanceof MessageReaction
			? (interaction.message.author ?? undefined)
			: interaction instanceof Message
				? interaction.author
				: interaction instanceof VoiceState
					? interaction.member?.user
					: (undefined as never);
}

export function resolveMember(
	interaction: BaseInteraction | SimpleCommandMessage | Message | VoiceState | MessageReaction,
): GuildMember | APIInteractionGuildMember | undefined;
export function resolveMember(
	interaction: SimpleCommandMessage | Message | VoiceState | MessageReaction,
): GuildMember | undefined;
export function resolveMember(
	interaction: BaseInteraction | SimpleCommandMessage | Message | VoiceState | MessageReaction,
): GuildMember | APIInteractionGuildMember | undefined {
	return interaction instanceof BaseInteraction || interaction instanceof Message || interaction instanceof VoiceState
		? (interaction.member ?? undefined)
		: (interaction instanceof SimpleCommandMessage || interaction instanceof MessageReaction
			? (interaction.message.member ?? undefined)
			: (undefined as never));
}

export function resolveGuild(interaction: VoiceState): Guild;
export function resolveGuild(
	interaction: BaseInteraction | SimpleCommandMessage | Message | VoiceState | MessageReaction,
): Guild | undefined;
export function resolveGuild(
	interaction: BaseInteraction | SimpleCommandMessage | Message | VoiceState | MessageReaction,
): Guild | undefined {
	return interaction instanceof BaseInteraction
		? (interaction.guild ?? undefined)
		: interaction instanceof SimpleCommandMessage || interaction instanceof MessageReaction
			? (interaction.message.guild ?? undefined)
			: interaction instanceof Message || interaction instanceof VoiceState
				? (interaction.guild ?? undefined)
				: (undefined as never);
}

export function resolveChannel(interaction: SimpleCommandMessage | Message | MessageReaction): TextBasedChannel;
export function resolveChannel(
	interaction: BaseInteraction | SimpleCommandMessage | Message | MessageReaction,
): TextBasedChannel | undefined;
export function resolveChannel(interaction: VoiceState): VoiceBasedChannel | undefined;
export function resolveChannel(
	interaction: BaseInteraction | SimpleCommandMessage | Message | VoiceState | MessageReaction,
): TextBasedChannel | VoiceBasedChannel | undefined;
export function resolveChannel(
	interaction: BaseInteraction | SimpleCommandMessage | Message | VoiceState | MessageReaction,
): TextBasedChannel | VoiceBasedChannel | undefined {
	return interaction instanceof BaseInteraction || interaction instanceof Message || interaction instanceof VoiceState
		? (interaction.channel ?? undefined)
		: (interaction instanceof SimpleCommandMessage || interaction instanceof MessageReaction
			? interaction.message.channel
			: (undefined as never));
}

export function resolveAction(interaction: BaseInteraction | SimpleCommandMessage): string {
	return interaction instanceof CommandInteraction || interaction instanceof AutocompleteInteraction
		? interaction.commandName
		: interaction instanceof MessageComponentInteraction || interaction instanceof ModalSubmitInteraction
			? interaction.customId
			: interaction instanceof SimpleCommandMessage
				? interaction.name
				: (undefined as never);
}

export function resolveLocale(interaction: BaseInteraction): Locale {
	return interaction instanceof BaseInteraction ? interaction.locale : (undefined as never);
}

export function resolveGuildLocale(interaction: BaseInteraction | SimpleCommandMessage): Locale | undefined {
	return interaction instanceof BaseInteraction
		? (interaction.guildLocale ?? undefined)
		: (interaction instanceof SimpleCommandMessage
			? interaction.message.guild?.preferredLocale
			: (undefined as never));
}
