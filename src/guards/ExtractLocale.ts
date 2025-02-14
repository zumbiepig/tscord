import { BaseInteraction } from 'discord.js';
import {
	type ArgsOf,
	type GuardFunction,
	SimpleCommandMessage,
} from 'discordx';

import { L } from '@/i18n';
import { getLocaleFromInteraction } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

/**
 * Extract locale from any interaction and pass it as guard data
 */
export const ExtractLocale: GuardFunction<
	ArgsOf<'interactionCreate' | 'messageCreate'>,
	InteractionData
> = async ([arg], _client, next, guardData) => {
	if (arg instanceof BaseInteraction || arg instanceof SimpleCommandMessage)
		guardData.localize = L[getLocaleFromInteraction(interaction)];

	await next();
};
