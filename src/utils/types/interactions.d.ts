import type { ICategory } from '@discordx/utilities';
import type {
	ButtonInteraction,
	CommandInteraction,
	ContextMenuCommandInteraction,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import type { DApplicationCommand, SimpleCommandMessage } from 'discordx';

import type { Locales, TranslationFunctions } from '@/i18n';

export type EmittedInteractions =
	| CommandInteraction
	| SimpleCommandMessage
	| ContextMenuCommandInteraction;
export type OnTheFlyInteractions =
	| ButtonInteraction
	| StringSelectMenuInteraction
	| ModalSubmitInteraction;

export type AllInteractions = EmittedInteractions | OnTheFlyInteractions;

export type InteractionsConstants =
	| 'CHAT_INPUT_COMMAND_INTERACTION'
	| 'SIMPLE_COMMAND_MESSAGE'
	| 'CONTEXT_MENU_INTERACTION'
	| 'BUTTON_INTERACTION'
	| 'SELECT_MENU_INTERACTION'
	| 'STRING_SELECT_MENU_INTERACTION'
	| 'MODAL_SUBMIT_INTERACTION';

export type CommandCategory = DApplicationCommand & ICategory;

export interface InteractionData {
	sanitizedLocale: Locales;
	localize: TranslationFunctions;
}
