import { Category } from '@discordx/utilities';
import {
	ActionRowBuilder,
	type APISelectMenuOption,
	CommandInteraction,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from 'discord.js';
import {
	Client,
	Discord,
	MetadataStorage,
	SelectMenuComponent,
} from 'discordx';

import { type TranslationFunctions } from '@/i18n';
import { Slash } from '@/utils/decorators';
import { chunkArray, resolveGuild, validString } from '@/utils/functions';
import type { CommandCategory, InteractionData } from '@/utils/types';
import { colorsConfig } from '@/configs';

@Discord()
@Category('General')
export default class HelpCommand {
	private readonly _categories = new Map<string, CommandCategory[]>();

	constructor() {
		this.loadCategories();
	}

	@Slash({
		name: 'help',
	})
	async help(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData,
	) {
		const embed = await this.getEmbed({
			client,
			interaction,
			locale: localize,
		});

		const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
		components.push(this.getSelectDropdown('categories', localize));

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
		{ localize }: InteractionData,
	) {
		const category = interaction.values[0] ?? '';

		const embed = await this.getEmbed({
			client,
			interaction,
			category,
			locale: localize,
		});
		const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
		components.push(this.getSelectDropdown(category, localize));

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
		locale,
	}: {
		client: Client;
		interaction: CommandInteraction | StringSelectMenuInteraction;
		category?: string;
		pageNumber?: number;
		locale: TranslationFunctions;
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
				.setTitle(locale.COMMANDS.HELP.EMBED.TITLE())
				.setThumbnail(
					'https://upload.wikimedia.org/wikipedia/commons/a/a4/Cute-Ball-Help-icon.png',
				)
				.setColor(colorsConfig.primary);

			const currentGuild = resolveGuild(interaction);
			const applicationCommands = [
				...(currentGuild ? (await currentGuild.commands.fetch()).values() : []),
				...(client.application
					? (await client.application.commands.fetch()).values()
					: []),
			];

			for (const category of this._categories) {
				const commands = category[1].map((cmd) => {
					return `</${cmd.group ? `${cmd.group} ` : ''}${cmd.subgroup ? `${cmd.subgroup} ` : ''}${cmd.name}:${applicationCommands.find((acmd) => acmd.name === (cmd.group ? cmd.group : cmd.name))?.id ?? ''}>`;
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
			.setTitle(locale.COMMANDS.HELP.EMBED.CATEGORY_TITLE({ category }))
			.setFooter({
				text: `${client.user?.username ?? ''} • Page ${(pageNumber + 1).toString()} of ${maxPage.toString()}`,
			});

		if (!resultsOfPage) return embed;

		for (const item of resultsOfPage) {
			const currentGuild = resolveGuild(interaction);
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
			const name = `</${item.group ? `${item.group} ` : ''}${item.subgroup ? `${item.subgroup} ` : ''}${item.name}:${applicationCommands.find((acmd) => acmd.name === (item.group ? item.group : item.name))?.id ?? ''}>`;

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
		locale: TranslationFunctions,
	): ActionRowBuilder<StringSelectMenuBuilder> {
		const optionsForEmbed: APISelectMenuOption[] = [];

		optionsForEmbed.push({
			description: locale.COMMANDS.HELP.SELECT_MENU.TITLE(),
			label: 'Categories',
			value: 'categories',
			default: defaultValue === 'categories',
		});

		for (const [category] of this._categories) {
			const description = locale.COMMANDS.HELP.SELECT_MENU.CATEGORY_DESCRIPTION(
				{
					category,
				},
			);
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

	loadCategories(): void {
		const commands: CommandCategory[] = MetadataStorage.instance
			.applicationCommandSlashesFlat as CommandCategory[];

		for (const command of commands) {
			const { category } = command;
			if (category && validString(category)) {
				if (this._categories.has(category)) {
					this._categories.get(category)?.push(command);
				} else {
					this._categories.set(category, [command]);
				}
			}
		}
	}
}
