import { BaseInteraction, type Interaction, Locale } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

import { generalConfig } from '@/configs';
import { User } from '@/entities';
import { isLocale, L, loadedLocales, locales as i18nLocales, type Translations } from '@/i18n';
import { Database } from '@/services';
import {
	resolveDependency,
	resolveGuildLocale,
	resolveLocale,
	resolveUser,
} from '@/utils/functions';
import type { SanitizedOptions, TranslationPaths, BotLocales } from '@/utils/types';
import type { Get, Replace } from 'type-fest';

export function setOptionsLocalization<
	K extends SanitizedOptions & { name?: string, description?: string },
>({
	options,
	target,
	localizationSource,
}: {
	options: K;
	target: 'name' | 'name_and_description';
	localizationSource: Replace<TranslationPaths, '.NAME' | '.DESCRIPTION', ''>;
}) {
	const nameLocalizations = getLocalizationMap(`${localizationSource}.NAME`);
	const descriptionLocalizations = getLocalizationMap(`${localizationSource}.DESCRIPTION`);

	options.name ??= nameLocalizations[generalConfig.defaultLocale];
	options.nameLocalizations ??= nameLocalizations;

	if (target !== 'name_and_description') {
		options.description ??= descriptionLocalizations[generalConfig.defaultLocale];
		options.descriptionLocalizations ??= descriptionLocalizations;

		if (!options.description) {
			const fallbackDescriptionLocalizations = getLocalizationMap('SHARED.NO_COMMAND_DESCRIPTION')
			options.description = fallbackDescriptionLocalizations[generalConfig.defaultLocale]
			options.descriptionLocalizations = fallbackDescriptionLocalizations;
		}
	}

	return options;
}

/**
 * Get the locale from an interaction.
 * @param interaction
 * @param skipTranslationCheck skip checking if translations exist for the locale
 * @returns The locale of the interaction.
 */
export async function getLocaleFromInteraction(
	interaction: Interaction | SimpleCommandMessage,
	skipTranslationCheck?: false,
): Promise<BotLocales>
export async function getLocaleFromInteraction(
	interaction: Interaction | SimpleCommandMessage,
	skipTranslationCheck: true,
): Promise<Locale>
export async function getLocaleFromInteraction(
	interaction: Interaction | SimpleCommandMessage,
	skipTranslationCheck = false,
): Promise<BotLocales|Locale> {
	const resolvedLocales: (Locale | undefined)[] = [];

	const db = await resolveDependency(Database);
	const dbUser = await db.get(User).findOne(resolveUser(interaction).id);

	if (interaction instanceof BaseInteraction) {
		const interactionLocale = resolveLocale(interaction);
		if (dbUser) dbUser.locale = interactionLocale;
		resolvedLocales.push(interactionLocale);
	} else if (interaction instanceof SimpleCommandMessage) {
		resolvedLocales.push(dbUser?.locale);
	}

	resolvedLocales.push(resolveGuildLocale(interaction));

	return resolvedLocales.find(locale => locale !== undefined && (skipTranslationCheck || isLocale(locale))) ?? generalConfig.defaultLocale;
}

/**
 * Populate a localization map with translations from a specified key.
 * @param key
 * @returns An object containing translations for every locale.
 */
export function getLocalizationMap<K extends TranslationPaths>(key: K): Record<BotLocales, Get<Translations, K>> {
	return Object.fromEntries(i18nLocales.map(locale => [locale, key.split('.').reduce((obj, key) => obj?.[key as keyof typeof obj], loadedLocales[locale] as object) as Get<Translations, K>])) as Record<BotLocales, Get<Translations, K>>;
}
