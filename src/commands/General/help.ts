import { Category } from '@discordx/utilities';
import {
	ActionRowBuilder,
	type BaseInteraction,
	type BaseMessageOptions,
	CommandInteraction,
	EmbedBuilder,
	type MessageComponentInteraction,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Client, DApplicationCommand, Discord, SelectMenuComponent } from 'discordx';
import { injectable } from 'tsyringe';

import { colorsConfig } from '@/configs';
import { type TranslationFunctions } from '@/i18n';
import { Slash } from '@/utils/decorators';
import { chunkArray } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';
import { Paginate, Pagination, PaginationType } from '@discordx/pagination';

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
	@SelectMenuComponent({ id: 'help-category-select-menu' })
	async help(
		interaction: CommandInteraction | StringSelectMenuInteraction,
		client: Client,
		{ translations }: InteractionData,
	) {
		await interaction.followUp(
			await this.getEmbed({ client, interaction, translations, selectedCategory: interaction.values[0] }),
		);
	}

	private async getEmbed({
		client,
		interaction,
		translations,
		selectedCategory = '',
		pageNumber = 0,
	}: {
		client: Client;
		interaction: CommandInteraction | MessageComponentInteraction;
		translations: TranslationFunctions;
		selectedCategory?: string | undefined;
		pageNumber?: number | undefined;
	}): Promise<BaseMessageOptions> {
		const applicationCommands = await client.application?.commands.fetch();

		if (selectedCategory === '')
			interaction[interaction.isMessageComponent() ? 'update' : 'editReply'](new EmbedBuilder()
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.setColor(colorsConfig.basicEmbeds.primary)
				.setTitle(translations.COMMANDS.HELP.EMBED.SELECT_CATEGORY_TITLE())
				.addFields(
					[...this._categories.entries()].map(([category, commands]) => ({
						name: category,
						value: commands
							.map(
								(cmd) =>
									'</' +
									`${cmd.group ? `${cmd.group} ` : ''}${cmd.subgroup ? `${cmd.subgroup} ` : ''}${cmd.name}` +
									':' +
									(applicationCommands?.find(({ name }) => name === (cmd.group ?? cmd.name))?.id ?? '') +
									'>',
							)
							.join(', '),
					})),
				)
				.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Cute-Ball-Help-icon.png');
		else
			new Pagination(
				interaction,
				chunkArray(this._categories.get(selectedCategory) ?? [], 24).map((chunk, i, arr) => ({
					embeds: [
						new EmbedBuilder()
							.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
							.setColor(colorsConfig.basicEmbeds.primary)
							.setTitle(translations.COMMANDS.HELP.EMBED.CATEGORY_TITLE({ category: selectedCategory }))
							.addFields(
								chunk.map((cmd) => ({
									name:
										'</' +
										`${cmd.group ? `${cmd.group} ` : ''}${cmd.subgroup ? `${cmd.subgroup} ` : ''}${cmd.name}` +
										':' +
										(applicationCommands?.find((acmd) => acmd.name === (cmd.group ?? cmd.name))?.id ?? '') +
										'>',
									value: cmd.description,
									inline: true,
								})),
							)
							.setFooter({
								text: `${client.user?.username ?? ''} • Page ${(i + 1).toString()} of ${arr.length.toString()}`,
							}),
					],
					components: [
						new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
							new StringSelectMenuBuilder().setCustomId('help-category-select-menu').addOptions([
								new StringSelectMenuOptionBuilder()
									.setLabel('Categories')
									.setValue('')
									.setDescription(translations.COMMANDS.HELP.SELECT_MENU.SELECT_CATEGORY_DESCRIPTION())
									.setDefault(selectedCategory === ''),
								...[...this._categories.keys()].map((category) =>
									new StringSelectMenuOptionBuilder()
										.setLabel(category)
										.setValue(category)
										.setDescription(translations.COMMANDS.HELP.SELECT_MENU.CATEGORY_DESCRIPTION({ category }))
										.setDefault(selectedCategory === category),
								),
							]),
						),
					],
				})),
				{ type: PaginationType.Button },
			).send();
	}
}
