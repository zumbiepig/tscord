import type { TranslationFunctions } from '@/i18n';
import type { getTypeOfInteraction } from '@/utils/functions';

export type InteractionsConstants = ReturnType<typeof getTypeOfInteraction>;

export interface InteractionData {
	localize: TranslationFunctions;
}
