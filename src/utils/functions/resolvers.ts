import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Message,
	MessageContextMenuCommandInteraction,
	MessageReaction,
	ModalSubmitInteraction,
	type PartialMessageReaction,
	StringSelectMenuInteraction,
	UserContextMenuCommandInteraction,
	VoiceState,
} from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

import type { AllInteractions } from '@/utils/types';

const resolvers = {
	user: {
		SimpleCommandMessage: (interaction: SimpleCommandMessage) =>
			interaction.message.author,
		ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) =>
			interaction.user,
		UserContextMenuCommandInteraction: (
			interaction: UserContextMenuCommandInteraction,
		) => interaction.member?.user ?? null,
		MessageContextMenuCommandInteraction: (
			interaction: MessageContextMenuCommandInteraction,
		) => interaction.member?.user ?? null,

		ButtonInteraction: (interaction: ButtonInteraction) =>
			interaction.member?.user ?? null,
		StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) =>
			interaction.member?.user ?? null,
		ModalSubmitInteraction: (interaction: ModalSubmitInteraction) =>
			interaction.member?.user ?? null,

		Message: (interaction: Message) => interaction.author,
		VoiceState: (interaction: VoiceState) => interaction.member?.user ?? null,
		MessageReaction: (interaction: MessageReaction) =>
			interaction.message.author,
		PartialMessageReaction: (interaction: PartialMessageReaction) =>
			interaction.message.author,

		fallback: (_: unknown) => null,
	},

	member: {
		SimpleCommandMessage: (interaction: SimpleCommandMessage) =>
			interaction.message.member,
		ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) =>
			interaction.member,
		UserContextMenuCommandInteraction: (
			interaction: UserContextMenuCommandInteraction,
		) => interaction.member,
		MessageContextMenuCommandInteraction: (
			interaction: MessageContextMenuCommandInteraction,
		) => interaction.member,

		ButtonInteraction: (interaction: ButtonInteraction) => interaction.member,
		StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) =>
			interaction.member,
		ModalSubmitInteraction: (interaction: ModalSubmitInteraction) =>
			interaction.member,

		Message: (interaction: Message) => interaction.member,
		VoiceState: (interaction: VoiceState) => interaction.member,
		MessageReaction: (interaction: MessageReaction) =>
			interaction.message.member,
		PartialMessageReaction: (interaction: PartialMessageReaction) =>
			interaction.message.member,

		fallback: (_: unknown) => null,
	},

	guild: {
		SimpleCommandMessage: (interaction: SimpleCommandMessage) =>
			interaction.message.guild,
		ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) =>
			interaction.guild,
		UserContextMenuCommandInteraction: (
			interaction: UserContextMenuCommandInteraction,
		) => interaction.guild,
		MessageContextMenuCommandInteraction: (
			interaction: MessageContextMenuCommandInteraction,
		) => interaction.guild,

		ButtonInteraction: (interaction: ButtonInteraction) => interaction.guild,
		StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) =>
			interaction.guild,
		ModalSubmitInteraction: (interaction: ModalSubmitInteraction) =>
			interaction.guild,

		fallback: (_: unknown) => null,
	},

	channel: {
		ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) =>
			interaction.channel,
		SimpleCommandMessage: (interaction: SimpleCommandMessage) =>
			interaction.message.channel,
		UserContextMenuCommandInteraction: (
			interaction: UserContextMenuCommandInteraction,
		) => interaction.channel,
		MessageContextMenuCommandInteraction: (
			interaction: MessageContextMenuCommandInteraction,
		) => interaction.channel,

		ButtonInteraction: (interaction: ButtonInteraction) => interaction.channel,
		StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) =>
			interaction.channel,
		ModalSubmitInteraction: (interaction: ModalSubmitInteraction) =>
			interaction.channel,

		fallback: (_: unknown) => null,
	},

	commandName: {
		SimpleCommandMessage: (interaction: SimpleCommandMessage) =>
			interaction.name,
		ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) =>
			interaction.commandName,
		UserContextMenuCommandInteraction: (
			interaction: UserContextMenuCommandInteraction,
		) => interaction.commandName,
		MessageContextMenuCommandInteraction: (
			interaction: MessageContextMenuCommandInteraction,
		) => interaction.commandName,

		fallback: (_: unknown) => null,
	},

	action: {
		ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) =>
			`${interaction.commandName} ${interaction.options.getSubcommandGroup(false) ?? ''} ${interaction.options.getSubcommand(false) ?? ''}`.trimEnd(),
		SimpleCommandMessage: (interaction: SimpleCommandMessage) =>
			interaction.name,
		UserContextMenuCommandInteraction: (
			interaction: UserContextMenuCommandInteraction,
		) => interaction.commandName,
		MessageContextMenuCommandInteraction: (
			interaction: MessageContextMenuCommandInteraction,
		) => interaction.commandName,

		ButtonInteraction: (interaction: ButtonInteraction) => interaction.customId,
		StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) =>
			interaction.customId,
		ModalSubmitInteraction: (interaction: ModalSubmitInteraction) =>
			interaction.customId,

		fallback: (_: unknown) => null,
	},

	locale: {
		SimpleCommandMessage: (interaction: SimpleCommandMessage) =>
			interaction.message.guild?.preferredLocale ?? null,
		ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) =>
			interaction.locale,
		UserContextMenuCommandInteraction: (
			interaction: UserContextMenuCommandInteraction,
		) => interaction.locale,
		MessageContextMenuCommandInteraction: (
			interaction: MessageContextMenuCommandInteraction,
		) => interaction.locale,

		ButtonInteraction: (interaction: ButtonInteraction) => interaction.locale,
		StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) =>
			interaction.locale,
		ModalSubmitInteraction: (interaction: ModalSubmitInteraction) =>
			interaction.locale,

		fallback: (_: unknown) => null,
	},
};

type InteractionTypes<T extends Record<string, (_: unknown) => unknown>> = Parameters<T[Exclude<keyof T, 'fallback'>]>[0]

export function resolveUser(interaction: InteractionTypes<typeof resolvers.user>) {
	return (
		resolvers.user[
			getTypeOfInteraction(interaction) as keyof typeof resolvers.user
		](interaction as keyof typeof interaction) ??
		resolvers.user.fallback(interaction)
	);
}

export function resolveMember(interaction: AllInteractions) {
	return (
		resolvers.member[
			getTypeOfInteraction(interaction) as keyof typeof resolvers.member
		](interaction as keyof typeof interaction) ??
		resolvers.member.fallback(interaction)
	);
}

export function resolveGuild(interaction: AllInteractions) {
	return (
		resolvers.guild[
			getTypeOfInteraction(interaction) as keyof typeof resolvers.guild
		](interaction as keyof typeof interaction) ??
		resolvers.guild.fallback(interaction)
	);
}

export function resolveChannel(interaction: AllInteractions) {
	return (
		resolvers.channel[
			getTypeOfInteraction(interaction) as keyof typeof resolvers.channel
		](interaction as keyof typeof interaction) ??
		resolvers.channel.fallback(interaction)
	);
}

export function resolveCommandName(interaction: AllInteractions) {
	return (
		resolvers.commandName[
			getTypeOfInteraction(interaction) as keyof typeof resolvers.commandName
		](interaction as keyof typeof interaction) ??
		resolvers.commandName.fallback(interaction)
	);
}

export function resolveAction(interaction: AllInteractions) {
	return (
		resolvers.action[
			getTypeOfInteraction(interaction) as keyof typeof resolvers.action
		](interaction as keyof typeof interaction) ??
		resolvers.action.fallback(interaction)
	);
}

export function resolveLocale(interaction: AllInteractions) {
	return (
		resolvers.locale[
			getTypeOfInteraction(interaction) as keyof typeof resolvers.locale
		](interaction as keyof typeof interaction) ??
		resolvers.locale.fallback(interaction)
	);
}

export function getTypeOfInteraction(interaction: object): string {
	return interaction.constructor.name;
}
