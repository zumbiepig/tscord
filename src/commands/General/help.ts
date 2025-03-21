import { Pagination, PaginationType } from '@discordx/pagination';
import { Category } from '@discordx/utilities';
import {
	ActionRowBuilder,
	type BaseMessageOptions,
	CommandInteraction,
	EmbedBuilder,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Client, DApplicationCommand, Discord, SelectMenuComponent } from 'discordx';
import { injectable } from 'tsyringe';

import { colorsConfig } from '@/configs';
import { Slash } from '@/utils/decorators';
import { chunkArray } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

@Discord()
@injectable()
@Category('General')
export default class HelpCommand {
	private readonly _categories = new Map<string, DApplicationCommand[]>();

	constructor(private client: Client) {
		// load categories
		for (const command of this.client.applicationCommandSlashesFlat) {
			const group = command.group ?? 'Uncategorized';
			if (!this._categories.has(group)) this._categories.set(group, []);
			this._categories.get(group)?.push(command);
		}
	}

	@Slash({ nameLocalizations: 'COMMANDS.HELP.NAME', descriptionLocalizations: 'COMMANDS.HELP.DESCRIPTION' })
	@SelectMenuComponent({ id: 'help-category-select-menu' })
	async help(
		interaction: CommandInteraction | StringSelectMenuInteraction,
		client: Client,
		{ translations }: InteractionData,
	) {
		const selectedCategory = interaction.isMessageComponent() ? (interaction.values[0] ?? '') : '';
		const applicationCommands = await client.application?.commands.fetch();

		const components = [
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
		];

		if (selectedCategory === '') {
			const msg: BaseMessageOptions = {
				embeds: [
					new EmbedBuilder()
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
						.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Cute-Ball-Help-icon.png'),
				],
				components,
			};
			await (interaction.isMessageComponent() ? interaction.update(msg) : interaction.editReply(msg));
		} else {
			await new Pagination(
				interaction,
				chunkArray(this._categories.get(selectedCategory) ?? [], 24).map((page, i, pages) => ({
					embeds: [
						new EmbedBuilder()
							.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
							.setColor(colorsConfig.basicEmbeds.primary)
							.setTitle(translations.COMMANDS.HELP.EMBED.CATEGORY_TITLE({ category: selectedCategory }))
							.addFields(
								page.map((cmd) => ({
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
								text: `${client.user?.username ?? ''} • Page ${(i + 1).toString()} of ${pages.length.toString()}`,
							}),
					],
					components,
				})),
				{ type: PaginationType.Button },
			).send();
		}
	}
}
