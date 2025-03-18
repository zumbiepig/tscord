import { Category } from '@discordx/utilities';
import {
	ActionRowBuilder,
	type BaseMessageOptions,
	CommandInteraction,
	EmbedBuilder,
	type Interaction,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
} from 'discord.js';
import { Client, DApplicationCommand, Discord, SelectMenuComponent } from 'discordx';
import { injectable } from 'tsyringe';

import { colorsConfig } from '@/configs';
import { type TranslationFunctions } from '@/i18n';
import { Slash } from '@/utils/decorators';
import { chunkArray, resolveGuild, validString } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

@Discord()
@injectable()
@Category('General')
export default class HelpCommand {
	private readonly _categories = new Map<string, DApplicationCommand[]>();

	constructor(private client: Client) {
		// load categories
		for (const command of this.client.applicationCommandSlashesFlat)
			if (this._categories.has(command.group ?? 'Uncategorized'))
				this._categories.get(command.group ?? 'Uncategorized')?.push(command);
			else this._categories.set(command.group ?? 'Uncategorized', [command]);
	}

	@Slash({ nameLocalizations: 'COMMANDS.HELP.NAME', descriptionLocalizations: 'COMMANDS.HELP.DESCRIPTION' })
	async help(interaction: CommandInteraction, client: Client, { translations }: InteractionData) {
		await interaction.followUp(await this.getEmbed({ client, interaction, translations }));
	}

	@SelectMenuComponent({ id: 'help-category-selector' })
	async selectCategory(interaction: StringSelectMenuInteraction, client: Client, { translations }: InteractionData) {
		await interaction.update(
			await this.getEmbed({ client, interaction, translations, selectedCategory: interaction.values[0] }),
		);
	}

	private async getEmbed({
		client,
		interaction,
		translations,
		selectedCategory,
		pageNumber = 0,
	}: {
		client: Client;
		interaction: CommandInteraction | StringSelectMenuInteraction;
		translations: TranslationFunctions;
		selectedCategory?: string | undefined;
		pageNumber?: number;
	}): Promise<BaseMessageOptions> {
		return {
			embeds: [
				await this.getEmbed2({ client, interaction, translations, category: selectedCategory ?? '', pageNumber }),
			],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.addOptions([
							{
								label: 'Categories',
								value: 'categories',
								description: translations.COMMANDS.HELP.SELECT_MENU.TITLE(),
								default: selectedCategory === 'categories',
							},
							...[...this._categories.keys()].map((category) => ({
								label: category,
								value: category,
								description: translations.COMMANDS.HELP.SELECT_MENU.CATEGORY_DESCRIPTION({ category }),
								default: selectedCategory === category,
							})),
						])
						.setCustomId('help-category-selector'),
				),
			],
		};
	}

	private async getEmbed2({
		client,
		interaction,
		category = '',
		translations,
		pageNumber = 0,
	}: {
		client: Client;
		interaction: CommandInteraction | StringSelectMenuInteraction;
		category?: string | undefined;
		translations: TranslationFunctions;
		pageNumber?: number;
	}): Promise<EmbedBuilder> {
		const commands = this._categories.get(category);

		// default embed
		if (!commands) {
			const embed = new EmbedBuilder()
				.setAuthor({
					name: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL({ forceStatic: false }),
				})
				.setTitle(translations.COMMANDS.HELP.EMBED.TITLE())
				.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Cute-Ball-Help-icon.png')
				.setColor(colorsConfig.basicEmbeds.primary);

			for (const category of this._categories)
				embed.addFields([
					{
						name: category[0],
						value: category[1]
							.map((cmd) => {
								return `</${cmd.group ? `${cmd.group} ` : ''}${cmd.subgroup ? `${cmd.subgroup} ` : ''}${cmd.name}:${
									[
										...((await resolveGuild(interaction)?.commands.fetch())?.values() ?? []),
										...((await client.application?.commands.fetch())?.values() ?? []),
									].find((acmd) => acmd.name === (cmd.group ?? cmd.name))?.id ?? ''
								}>`;
							})
							.join(', '),
					},
				]);

			return embed;
		} else {
			// specific embed
			const chunks = chunkArray(commands, 24);
			const maxPage = chunks.length;
			const resultsOfPage = chunks[pageNumber];

			const embed = new EmbedBuilder()
				.setAuthor({
					name: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL({ forceStatic: false }),
				})
				.setTitle(translations.COMMANDS.HELP.EMBED.CATEGORY_TITLE({ category }))
				.setFooter({
					text: `${client.user?.username ?? ''} • Page ${(pageNumber + 1).toString()} of ${maxPage.toString()}`,
				});

			if (!resultsOfPage) return embed;

			for (const item of resultsOfPage) {
				const currentGuild = resolveGuild(interaction as Interaction);
				const applicationCommands = [
					...(currentGuild ? (await currentGuild.commands.fetch()).values() : []),
					...(client.application ? await client.application.commands.fetch() : []).values(),
				];

				const fieldValue = validString(item.description) ? item.description : 'No description';
				const name = `</${item.group ? `${item.group} ` : ''}${item.subgroup ? `${item.subgroup} ` : ''}${item.name}:${applicationCommands.find((acmd) => acmd.name === (item.group ?? item.name))?.id ?? ''}>`;

				embed.addFields([{ name, value: fieldValue, inline: resultsOfPage.length > 5 }]);
			}

			return embed;
		}
	}
}
