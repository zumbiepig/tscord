import type { ApplicationCommandType, Locale } from 'discord.js';
import type {
	ApplicationCommandOptions as ApplicationCommandOptionsX,
	NotEmpty as NotEmptyX,
	SlashChoiceType as SlashChoiceTypeX,
	SlashGroupOptions as SlashGroupOptionsX,
} from 'discordx';

import type { Translations } from '@/i18n';

export declare enum AdditionalLocaleString {
	English = 'en',
}

export type TranslationsNestedPaths = NestedPaths<Translations>;

export type LocalizationMap = Partial<
	Record<`${Locale | AdditionalLocaleString}`, string>
>;

export interface SanitizedOptions {
	descriptionLocalizations?: LocalizationMap;
	nameLocalizations?: LocalizationMap;
	localizationSource?: TranslationsNestedPaths;
}

export type Sanitization<K> = Modify<K, SanitizedOptions>;

export type ApplicationCommandOptions = Sanitization<
	WithOptional<ApplicationCommandOptionsX<string, string>, 'description'>
>;

export type SlashGroupOptions = Sanitization<
	WithOptional<SlashGroupOptionsX<string, string, string>, 'description'>
>;

export type SlashOptionOptions = Sanitization<
	WithOptional<SlashOptionOptionsX<string, string>, 'description'>
>;

export type SlashChoiceType = Modify<SlashChoiceTypeX, SanitizedOptions>;

export type ContextMenuOptions = Modify<
	Modify<
		Omit<
			ApplicationCommandOptionsX<NotEmptyX<string>, string>,
			'description' | 'descriptionLocalizations'
		>,
		SanitizedOptions
	>,
	{
		type:
			| Exclude<ApplicationCommandType, ApplicationCommandType.ChatInput>
			| ApplicationCommandType.User
			| ApplicationCommandType.Message;
	}
>;
