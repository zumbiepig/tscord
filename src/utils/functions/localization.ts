import { BaseInteraction, type Interaction, Locale } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

import { generalConfig } from '@/configs';
import { User } from '@/entities';
import { isLocale, loadedLocales, locales as i18nLocales, type Translations } from '@/i18n';
import { Database } from '@/services';
import {
	resolveDependency,
	resolveGuildLocale,
	resolveLocale,
	resolveUser,
} from '@/utils/functions';
import type { TranslationPaths, BotLocales,ContextMenuOptions,SlashOptions,SlashChoiceOptions,SlashGroupOptions,SlashOptionOptions } from '@/utils/types';
import type { Get } from 'type-fest';

export function setOptionsLocalization<T extends ContextMenuOptions | SlashOptions | SlashChoiceOptions | SlashGroupOptions | SlashOptionOptions>(options: T): T {
	if ('name' in options) {
		const nameLocalizations = getLocalizationMap(`${options.localizationSource}.NAME`);
		options.name ??= nameLocalizations[generalConfig.defaultLocale];
		options.nameLocalizations ??= nameLocalizations;
	}

	if ('description' in options) {
		let descriptionLocalizations = getLocalizationMap(`${options.localizationSource}.DESCRIPTION`);
		if (!descriptionLocalizations[generalConfig.defaultLocale])
			descriptionLocalizations = getLocalizationMap('SHARED.NO_COMMAND_DESCRIPTION')

		options.description ??= descriptionLocalizations[generalConfig.defaultLocale];
		options.descriptionLocalizations ??= descriptionLocalizations;
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
export function getLocalizationMap<K extends TranslationPaths>(key: K): {[x in BotLocales]: Get<Translations, K>} {
	return Object.fromEntries(i18nLocales.map(locale => [locale, key.split('.').reduce((obj, key) => obj?.[key as keyof typeof obj], loadedLocales[locale] as object) as Get<Translations, K>])) as Record<BotLocales, Get<Translations, K>>;
}
