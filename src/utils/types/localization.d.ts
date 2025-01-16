import type { ApplicationCommandType, Locale } from 'discord.js';
import type {
	ApplicationCommandOptions as ApplicationCommandOptionsX,
	NotEmpty as NotEmptyX,
	SlashChoiceType as SlashChoiceTypeX,
	SlashGroupOptions as SlashGroupOptionsX,
} from 'discordx';

import type { Translations } from '@/i18n';

declare enum AdditionalLocaleString {
	English = 'en',
}

type TranslationsNestedPaths = NestedPaths<Translations>;

type LocalizationMap = Partial<
	Record<`${Locale | AdditionalLocaleString}`, string>
>;

interface SanitizedOptions {
	descriptionLocalizations?: LocalizationMap;
	nameLocalizations?: LocalizationMap;
	localizationSource?: TranslationsNestedPaths;
}

type Sanitization<K> = Modify<K, SanitizedOptions>;

type ApplicationCommandOptions = Sanitization<
	WithOptional<ApplicationCommandOptionsX<string, string>, 'description'>
>;

type SlashGroupOptions = Sanitization<
	WithOptional<SlashGroupOptionsX<string, string, string>, 'description'>
>;

type SlashOptionOptions = Sanitization<
	WithOptional<SlashOptionOptionsX<string, string>, 'description'>
>;

type SlashChoiceType = Modify<SlashChoiceTypeX, SanitizedOptions>;

type ContextMenuOptions = Modify<
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
