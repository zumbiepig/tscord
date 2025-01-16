import {
	ButtonInteraction,
	CommandInteraction,
	ContextMenuCommandInteraction,
	type Interaction,
	StringSelectMenuInteraction,
} from 'discord.js';
import { type GuardFunction, SimpleCommandMessage } from 'discordx';

import { getLocaleFromInteraction, L } from '@/i18n';
import type { InteractionData } from '@/utils/types';

/**
 * Extract locale from any interaction and pass it as guard data
 */
export const ExtractLocale: GuardFunction<
	Interaction,
	InteractionData
> = async (interaction, _client, next, guardData) => {
	if (
		interaction instanceof SimpleCommandMessage ||
		interaction instanceof CommandInteraction ||
		interaction instanceof ContextMenuCommandInteraction ||
		interaction instanceof StringSelectMenuInteraction ||
		interaction instanceof ButtonInteraction
	) {
		const sanitizedLocale = getLocaleFromInteraction(interaction);
		guardData.sanitizedLocale = sanitizedLocale;
		guardData.localize = L[sanitizedLocale];
	}

	return next(guardData);
};
