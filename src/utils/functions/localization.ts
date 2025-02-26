import { BaseInteraction, type Interaction } from 'discord.js';
import { SimpleCommandMessage } from 'discordx';

import { generalConfig } from '@/configs';
import { User } from '@/entities';
import { L, loadedLocales, type Locales, locales } from '@/i18n';
import { Database } from '@/services';
import {
	resolveDependency,
	resolveLocale,
	resolveUser,
} from '@/utils/functions';
import type { SanitizedOptions, TranslationPath } from '@/utils/types';

export function getLocalizedInfo(
	target: 'NAME' | 'DESCRIPTION',
	localizationSource: TranslationPath,
) {
	const localizations = Object.fromEntries(
		locales
			.map((locale) => [
				locale,
				getLocalizationFromPathString(
					`${localizationSource}.${target}` as TranslationPath,
					locale,
				),
			])
			.filter(([_, value]) => value),
	) as Record<Locales, string>;

	return Object.keys(localizations).length > 0 ? localizations : undefined;
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
		options[target as keyof typeof options] = (localizedInfo?.[
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
		(obj, key) => {
			return (obj as Record<string, unknown>)[key] ?? undefined;
		},
		loadedLocales[locale ?? generalConfig.defaultLocale],
	) as string;
}

export function setFallbackDescription<K extends SanitizedOptions>(
	options: K & { description?: string },
) {
	options.description =
		L[generalConfig.defaultLocale].SHARED.NO_COMMAND_DESCRIPTION();
	if (!options.descriptionLocalizations) options.descriptionLocalizations = {};

	for (const locale of locales)
		options.descriptionLocalizations[locale] =
			L[locale].SHARED.NO_COMMAND_DESCRIPTION();

	return options;
}

export async function getLocaleFromInteraction(
	interaction: Interaction | SimpleCommandMessage,
) {
	const db = await resolveDependency(Database);
	const user = await db.get(User).findOne(resolveUser(interaction).id);

	if (interaction instanceof BaseInteraction) {
		const interactionLocale = resolveLocale(interaction);
		if (user) user.locale = interactionLocale;
		return interactionLocale;
	} else {
		const guildLocale = resolveLocale(interaction);
		return (
			// return the user's cached locale if it was saved
			user?.locale ??
			// otherwise use the guild's preferred locale
			guildLocale ??
			// fallback to the bot's default locale
			generalConfig.defaultLocale
		);
	}
}
