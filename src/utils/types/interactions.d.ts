import type { TranslationFunctions } from '@/i18n';
import type { getTypeOfInteraction } from '@/utils/functions';
import type { Locale } from 'discord.js';

export interface InteractionData {
	interactionLocale: Locale;
	translations: TranslationFunctions;
}
