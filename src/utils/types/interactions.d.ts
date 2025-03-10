import type { Locale } from 'discord.js';

import type { TranslationFunctions } from '@/i18n';
import type { getTypeOfInteraction } from '@/utils/functions';

export interface InteractionData {
	interactionLocale: Locale;
	translations: TranslationFunctions;
}
