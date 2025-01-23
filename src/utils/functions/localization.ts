import { generalConfig } from '@/configs';
import { detectLocale, L, loadedLocales, type Locales, locales } from '@/i18n';
import { resolveLocale } from '@/utils/functions';
import type {
	AllInteractions,
	SanitizedOptions,
	TranslationsNestedPaths,
} from '@/utils/types';

export function getLocalizedInfo(
	target: 'NAME' | 'DESCRIPTION',
	localizationSource: TranslationsNestedPaths,
) {
	const localizations = Object.fromEntries(
		locales
			.map((locale) => [
				locale,
				getLocalizationFromPathString(
					`${localizationSource}.${target}` as TranslationsNestedPaths,
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
	localizationSource: TranslationsNestedPaths;
	nameFallback?: string;
}) {
	const localizedInfo = getLocalizedInfo(
		target.toUpperCase() as 'NAME' | 'DESCRIPTION',
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

export function sanitizeLocales<K extends SanitizedOptions>(option: K) {
	// convert 'en' localizations to 'en-US' and 'en-GB'
	if (option.nameLocalizations?.en) {
		option.nameLocalizations['en-US'] = option.nameLocalizations.en;
		option.nameLocalizations['en-GB'] = option.nameLocalizations.en;
		delete option.nameLocalizations.en;
	}
	if (option.descriptionLocalizations?.en) {
		option.descriptionLocalizations['en-US'] =
			option.descriptionLocalizations.en;
		option.descriptionLocalizations['en-GB'] =
			option.descriptionLocalizations.en;
		delete option.descriptionLocalizations.en;
	}

	return option;
}

export function getLocalizationFromPathString(
	localePath: TranslationsNestedPaths,
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

	return sanitizeLocales(options);
}

function allInteractionsLocaleDetector(interaction: AllInteractions) {
	return () => {
		let locale = resolveLocale(interaction);

		if (['en-US', 'en-GB'].includes(locale ?? '')) locale = 'en';
		else if (locale === null) locale = generalConfig.defaultLocale;

		return [locale];
	};
}

export const getLocaleFromInteraction = (interaction: AllInteractions) =>
	detectLocale(allInteractionsLocaleDetector(interaction));
