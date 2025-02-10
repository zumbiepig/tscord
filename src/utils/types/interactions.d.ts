import type { Locale } from 'discord.js';

export type InteractionsConstants =
	| 'CHAT_INPUT_COMMAND_INTERACTION'
	| 'CONTEXT_MENU_COMMAND_INTERACTION'
	| 'AUTOCOMPLETE_INTERACTION'
	| 'SELECT_MENU_INTERACTION'
	| 'BUTTON_INTERACTION'
	| 'MODAL_SUBMIT_INTERACTION'
	| 'SIMPLE_COMMAND_MESSAGE';

export interface InteractionData {
	interactionLocale: Locale;
}
