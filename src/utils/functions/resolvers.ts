import { type Interaction } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

export function resolveUser(interaction: Interaction | SimpleCommandMessage) {
	return interaction instanceof SimpleCommandMessage ? interaction.message.author : interaction.user;
}

export function resolveMember(interaction: Interaction | SimpleCommandMessage) {
	return interaction instanceof SimpleCommandMessage
		? (interaction.message.member ?? undefined)
		: (interaction.member ?? undefined);
}

export function resolveGuild(interaction: Interaction | SimpleCommandMessage) {
	return interaction instanceof SimpleCommandMessage
		? (interaction.message.guild ?? undefined)
		: (interaction.guild ?? undefined);
}

export function resolveChannel(interaction: Interaction | SimpleCommandMessage) {
	return interaction instanceof SimpleCommandMessage ? interaction.message.channel : (interaction.channel ?? undefined);
}

export function resolveAction(interaction: Interaction | SimpleCommandMessage) {
	return interaction instanceof SimpleCommandMessage
		? interaction.name
		: interaction.isCommand() || interaction.isAutocomplete()
			? interaction.commandName +
				(interaction.options.getSubcommandGroup?.(false) ? ` ${interaction.options.getSubcommandGroup(false)}` : '') +
				(interaction.options.getSubcommand?.(false) ? ` ${interaction.options.getSubcommand(false)}` : '')
			: interaction.customId;
}

export function resolveLocale(interaction: Interaction) {
	return interaction.locale;
}

export function resolveGuildLocale(interaction: Interaction | SimpleCommandMessage) {
	return interaction instanceof SimpleCommandMessage
		? interaction.message.guild?.preferredLocale
		: (interaction.guildLocale ?? undefined);
}
