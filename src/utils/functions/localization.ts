import { BaseInteraction, type Interaction, Locale, type LocalizationMap } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

import { generalConfig } from '@/configs';
import { User } from '@/entities';
import { isLocale, L, loadedLocales, type Locales, locales as i18nLocales, type TranslationFunctions } from '@/i18n';
import { Database } from '@/services';
import {
	resolveDependency,
	resolveGuildLocale,
	resolveLocale,
	resolveUser,
} from '@/utils/functions';
import type { SanitizedOptions, TranslationPath } from '@/utils/types';
import type { Get } from 'type-fest';

export function getLocalizedInfo(
	target: 'NAME' | 'DESCRIPTION',
	localizationSource: TranslationPath,
) {
	return  Object.fromEntries(
		i18nLocales
			.map(locale => [
				locale,
				getLocalizationFromPathString(
					`${localizationSource}.${target}` as TranslationPath,
					locale,
				),
			])
			.filter(([_, value]) => value),
	) as Record<Locales, string>;
}

export function setOptionsLocalization<
	K extends SanitizedOptions & { name?: string },
>({
	options,
	target,
	localizationSource,
	nameFallback,
}: {
	options: K;
	target: 'name' | 'description';
	localizationSource: TranslationPath;
	nameFallback?: string;
}) {
	const localizedInfo = getLocalizedInfo(
		target.toUpperCase() as Uppercase<typeof target>,
		localizationSource,
	);
	if (!options[`${target}Localizations`] && localizedInfo)
		options[`${target}Localizations`] = localizedInfo;

	if (!options[target as keyof typeof options]) {
		options[target as keyof typeof options] = (localizedInfo[
			generalConfig.defaultLocale
		] ?? (target === 'name' ? nameFallback : undefined)) as K[keyof K];
	}

	return options;
}

export function getLocalizationFromPathString(
	localePath: TranslationPath,
	locale?: Locales,
): string {
	return localePath.split('.').reduce<unknown>(
		(object, key) => {
			return (object as Record<string, unknown>)[key] ?? undefined;
		},
		loadedLocales[locale ?? generalConfig.defaultLocale],
	) as string;
}

export function setFallbackDescription<K extends SanitizedOptions>(
	options: K & { description?: string },
) {
	options.description
		= L[generalConfig.defaultLocale].SHARED.NO_COMMAND_DESCRIPTION();
	if (!options.descriptionLocalizations) options.descriptionLocalizations = {};

	for (const locale of i18nLocales)
		options.descriptionLocalizations[locale]
			= L[locale].SHARED.NO_COMMAND_DESCRIPTION();

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
): Promise<Locales>
export async function getLocaleFromInteraction(
	interaction: Interaction | SimpleCommandMessage,
	skipTranslationCheck: true,
): Promise<Locale>
export async function getLocaleFromInteraction(
	interaction: Interaction | SimpleCommandMessage,
	skipTranslationCheck = false,
): Promise<Locales|Locale> {
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

export async function getLocalizationFromPathString(
	localePath: TranslationPath,
): Promise<Record<Locales, string>> {
	const localeMap: Record<Locales, string> = {} as Record<Locales, string>;
	for (const locale of i18nLocales) {
			const keys = localePath.split('.');
			let localizedFunction = L[locale];
			for (const key of keys) {
				localizedFunction = localizedFunction[key];
			}
			localeMap[locale] = (localizedFunction as Get<TranslationFunctions, typeof localePath>)();
	}
	return localeMap;
}