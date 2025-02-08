import type { ApplicationCommandType } from 'discord.js';
import type {
	ApplicationCommandOptions as ApplicationCommandOptionsX,
	NotEmpty as NotEmptyX,
	SlashChoiceType as SlashChoiceTypeX,
	SlashGroupOptions as SlashGroupOptionsX,
	SlashOptionOptions as SlashOptionOptionsX,
} from 'discordx';
import type {
	Except,
	Get,
	OverrideProperties,
	Paths,
	PositiveInfinity,
	SetOptional,
	Simplify,
} from 'type-fest';

import type { Locales, Translations } from '@/i18n';

export type TranslationPath = Paths<
	Translations,
	{ maxRecursionDepth: PositiveInfinity }
>;

export type TranslationType<K extends TranslationPath> = Simplify<
	Get<Translations, K>
>;

type LocalizationMap = Partial<Record<Locales, string>>;

export interface SanitizedOptions {
	descriptionLocalizations?: LocalizationMap;
	nameLocalizations?: LocalizationMap;
	localizationSource?: TranslationPath;
}

type Sanitization<K> = OverrideProperties<K, SanitizedOptions>;

export type ApplicationCommandOptions = Sanitization<
	SetOptional<ApplicationCommandOptionsX<string, string>, 'description'>
>;

export type SlashGroupOptions = Sanitization<
	SetOptional<SlashGroupOptionsX<string, string, string>, 'description'>
>;

export type SlashOptionOptions = Sanitization<
	SetOptional<SlashOptionOptionsX<string, string>, 'description'>
>;

export type SlashChoiceType = OverrideProperties<
	SlashChoiceTypeX,
	SanitizedOptions
>;

export type ContextMenuOptions = OverrideProperties<
	OverrideProperties<
		Except<
			ApplicationCommandOptionsX<NotEmptyX<string>, string>,
			'description' | 'descriptionLocalizations'
		>,
		SanitizedOptions
	>,
	{
		type: Exclude<ApplicationCommandType, ApplicationCommandType.ChatInput>;
	}
>;
