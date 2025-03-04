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
> = async ([interaction], _client, next, guardData) => {
	if (interaction instanceof BaseInteraction || interaction instanceof SimpleCommandMessage) {
		const locale = await getLocaleFromInteraction(interaction);
		guardData.localize = L[locale];
	}

	await next();
};
