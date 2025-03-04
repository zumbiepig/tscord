import { Category } from '@discordx/utilities';
import {
	ActionRowBuilder,
	type APISelectMenuOption,
	CommandInteraction,
	EmbedBuilder,
	type Interaction,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
} from 'discord.js';
import {
	Client,
	DApplicationCommand,
	Discord,
	SelectMenuComponent,
} from 'discordx';

import { colorsConfig } from '@/configs';
import { type TranslationFunctions } from '@/i18n';
import { Slash } from '@/utils/decorators';
import { chunkArray, resolveGuild, validString } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';
import { injectable } from 'tsyringe';

@Discord()
@injectable()
@Category('General')
export default class HelpCommand {
	private readonly _categories = new Map<string, DApplicationCommand[]>();

	constructor(private client: Client) {
		// load categories
		const commands = this.client.applicationCommandSlashesFlat

		for (const command of commands) {
			const { group } = command;
			if (group && validString(group)) {
				if (this._categories.has(group)) {
					this._categories.get(group)?.push(command);
				} else {
					this._categories.set(group, [command]);
				}
			}
		}
	}

	@Slash({
		name: 'help',
	})
	async help(
		interaction: CommandInteraction,
		client: Client,
		{ translations }: InteractionData,
	) {
		const embed = await this.getEmbed({
			client,
			interaction,
			translations: translations,
		});

		const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
		components.push(this.getSelectDropdown('categories', translations));

		await interaction.followUp({
			embeds: [embed],
			components: components,
		});
	}

	@SelectMenuComponent({
		id: 'help-category-selector',
	})
	async selectCategory(
		interaction: StringSelectMenuInteraction,
		client: Client,
		{ translations }: InteractionData,
	) {
		const category = interaction.values[0] ?? '';

		const embed = await this.getEmbed({
			client,
			interaction,
			category,
			translations: translations,
		});
		const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
		components.push(this.getSelectDropdown(category, translations));

		await interaction.update({
			embeds: [embed],
			components,
		});
	}

	private async getEmbed({
		client,
		interaction,
		category = '',
		pageNumber = 0,
		translations,
	}: {
		client: Client;
		interaction: CommandInteraction | StringSelectMenuInteraction;
		category?: string;
		pageNumber?: number;
		translations: TranslationFunctions;
	}): Promise<EmbedBuilder> {
		const commands = this._categories.get(category);

		// default embed
		if (!commands) {
			const embed = new EmbedBuilder()
				.setAuthor({
					name: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL({
						forceStatic: false,
					}),
				})
				.setTitle(translations.COMMANDS.HELP.EMBED.TITLE())
				.setThumbnail(
					'https://upload.wikimedia.org/wikipedia/commons/a/a4/Cute-Ball-Help-icon.png',
				)
				.setColor(colorsConfig.basicEmbeds.primary);

			const currentGuild = resolveGuild(interaction as Interaction);
			const applicationCommands = [
				...(currentGuild ? (await currentGuild.commands.fetch()).values() : []),
				...(client.application
					? (await client.application.commands.fetch()).values()
					: []),
			];

			for (const category of this._categories) {
				const commands = category[1].map((cmd) => {
					return `</${cmd.group ? `${cmd.group} ` : ''}${cmd.subgroup ? `${cmd.subgroup} ` : ''}${cmd.name}:${applicationCommands.find((acmd) => acmd.name === (cmd.group ?? cmd.name))?.id ?? ''}>`;
				});

				embed.addFields([
					{
						name: category[0],
						value: commands.join(', '),
					},
				]);
			}

			return embed;
		}

		// specific embed
		const chunks = chunkArray(commands, 24);
		const maxPage = chunks.length;
		const resultsOfPage = chunks[pageNumber];

		const embed = new EmbedBuilder()
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL({
					forceStatic: false,
				}),
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
				...(client.application
					? await client.application.commands.fetch()
					: []
				).values(),
			];

			const { description } = item;
			const fieldValue = validString(description)
				? description
				: 'No description';
			const name = `</${item.group ? `${item.group} ` : ''}${item.subgroup ? `${item.subgroup} ` : ''}${item.name}:${applicationCommands.find((acmd) => acmd.name === (item.group ?? item.name))?.id ?? ''}>`;

			embed.addFields([
				{
					name,
					value: fieldValue,
					inline: resultsOfPage.length > 5,
				},
			]);
		}

		return embed;
	}

	private getSelectDropdown(
		defaultValue = 'categories',
		translations: TranslationFunctions,
	): ActionRowBuilder<StringSelectMenuBuilder> {
		const optionsForEmbed: APISelectMenuOption[] = [];

		optionsForEmbed.push({
			description: translations.COMMANDS.HELP.SELECT_MENU.TITLE(),
			label: 'Categories',
			value: 'categories',
			default: defaultValue === 'categories',
		});

		for (const [category] of this._categories) {
			const description =
				translations.COMMANDS.HELP.SELECT_MENU.CATEGORY_DESCRIPTION({
					category,
				});
			optionsForEmbed.push({
				description,
				label: category,
				value: category,
				default: defaultValue === category,
			});
		}

		const selectMenu = new StringSelectMenuBuilder()
			.addOptions(optionsForEmbed)
			.setCustomId('help-category-selector');

		return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			selectMenu,
		);
	}
}
