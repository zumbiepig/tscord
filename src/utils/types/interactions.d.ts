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

type EmittedInteractions =
	| CommandInteraction
	| SimpleCommandMessage
	| ContextMenuCommandInteraction;
type OnTheFlyInteractions =
	| ButtonInteraction
	| StringSelectMenuInteraction
	| ModalSubmitInteraction;

type AllInteractions = EmittedInteractions | OnTheFlyInteractions;

type InteractionsConstants =
	| 'CHAT_INPUT_COMMAND_INTERACTION'
	| 'SIMPLE_COMMAND_MESSAGE'
	| 'CONTEXT_MENU_INTERACTION'
	| 'BUTTON_INTERACTION'
	| 'SELECT_MENU_INTERACTION'
	| 'STRING_SELECT_MENU_INTERACTION'
	| 'MODAL_SUBMIT_INTERACTION';

type CommandCategory = DApplicationCommand & ICategory;

interface InteractionData {
	sanitizedLocale: Locales;
	localize: TranslationFunctions;
}
