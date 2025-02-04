import type { ICategory } from '@discordx/utilities';
import type {
	ButtonInteraction,
	CommandInteraction,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import type { DApplicationCommand, SimpleCommandMessage } from 'discordx';

import type { Locales, TranslationFunctions } from '@/i18n';

export type EmittedInteractions =
	| CommandInteraction
	| SimpleCommandMessage
export type OnTheFlyInteractions =
	| ButtonInteraction
	| ModalSubmitInteraction
	| StringSelectMenuInteraction;

export type AllInteractions = EmittedInteractions | OnTheFlyInteractions;

/*export type InteractionsConstants =
	| 'ChatInputCommandInteraction'
	| 'SimpleCommandMessage'
	| 'MessageContextMenuCommandInteraction'
	| 'UserContextMenuCommandInteraction'
	| 'ButtonInteraction'
	| 'ModalSubmitInteraction'
	| 'StringSelectMenuInteraction';*/
export type InteractionsConstants = AllInteractions['constructor']['name'];

export type CommandCategory = DApplicationCommand & ICategory;

export interface InteractionData {
	sanitizedLocale: Locales;
	localize: TranslationFunctions;
}
