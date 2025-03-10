import { BaseInteraction, type Interaction, Locale, type LocalizationMap } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';
import type { Get } from 'type-fest';

import { generalConfig } from '@/configs';
import { User } from '@/entities';
import { isLocale, loadedLocales, locales as i18nLocales, type Translations } from '@/i18n';
import { Database } from '@/services';
import { resolveDependency, resolveGuildLocale, resolveLocale, resolveUser } from '@/utils/functions';
import type {
	BotLocales,
	Sanitization,
	TranslationPaths,
} from '@/utils/types';

export function setOptionsLocalization<
	T extends object,
>(options: T&Sanitization<{
	name?: string;
	nameLocalizations?: LocalizationMap;
	description?: string;
	descriptionLocalizations?: LocalizationMap;
}>): T {
	if ('nameLocalizations' in (options as T)) {
		const nameLocalizations = getLocalizationMap(options.nameLocalizations);
		options.name = nameLocalizations[generalConfig.defaultLocale];
		options.nameLocalizations = nameLocalizations;
	}

	if ('descriptionLocalizations' in options) {
		const descriptionLocalizations = getLocalizationMap(options.descriptionLocalizations);
		options.description = descriptionLocalizations[generalConfig.defaultLocale];
		options.descriptionLocalizations = descriptionLocalizations;
	}

	return options as T;
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
): Promise<BotLocales>;
export async function getLocaleFromInteraction(
	interaction: Interaction | SimpleCommandMessage,
	skipTranslationCheck: true,
): Promise<Locale>;
export async function getLocaleFromInteraction(
	interaction: Interaction | SimpleCommandMessage,
	skipTranslationCheck = false,
): Promise<BotLocales | Locale> {
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

	return (
		resolvedLocales.find((locale) => locale !== undefined && (skipTranslationCheck || isLocale(locale))) ??
		generalConfig.defaultLocale
	);
}

/**
 * Populate a localization map with translations from a specified key.
 * @param key
 * @returns An object containing translations for every locale.
 */
export function getLocalizationMap<K extends TranslationPaths>(key: K): Record<BotLocales, Get<Translations, K>> {
	return Object.fromEntries(
		i18nLocales.map((locale) => [
			locale,
			key.split('.').reduce<object>((obj, key) => obj[key as keyof typeof obj], loadedLocales[locale]) as Get<
				Translations,
				K
			>,
		]),
	) as Record<BotLocales, Get<Translations, K>>;
}
