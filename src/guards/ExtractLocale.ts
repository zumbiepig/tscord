import { BaseInteraction, type Locale } from 'discord.js';
import {
	type ArgsOf,
	type GuardFunction,
	SimpleCommandMessage,
} from 'discordx';

import { L } from '@/i18n';
import { getLocaleFromInteraction, resolveGuildLocale, resolveLocale } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

/**
 * Extract locale from any arg and pass it as guard data
 */
export const ExtractLocale: GuardFunction<
	ArgsOf<'interactionCreate' | 'messageCreate'>,
	InteractionData
> = async ([arg], _client, next, guardData) => {
	if (arg instanceof BaseInteraction || arg instanceof SimpleCommandMessage) {
		const locale = await getLocaleFromInteraction(arg);
		guardData.interactionLocale = await getLocaleFromInteraction(arg, true);
		guardData.translations = L[locale];
	}

	await next();
};
