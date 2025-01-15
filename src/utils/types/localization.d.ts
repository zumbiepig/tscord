import type { ApplicationCommandType, Locale } from 'discord.js';
import type {
	ApplicationCommandOptions,
	ApplicationCommandOptions,
	NotEmpty,
	SlashChoiceType,
	SlashGroupOptions,
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
	WithOptional<ApplicationCommandOptions<string, string>, 'description'>
>;

type SlashGroupOptions = Sanitization<
	WithOptional<SlashGroupOptions<string, string, string>, 'description'>
>;

type SlashOptionOptions = Sanitization<
	WithOptional<SlashOptionOptions<string, string>, 'description'>
>;

type SlashChoiceOption = Modify<SlashChoiceType, SanitizedOptions>;

type ContextMenuOptionsX = Omit<
	ApplicationCommandOptions<NotEmpty<string>, string> & {
		type: Exclude<ApplicationCommandType, ApplicationCommandType.ChatInput>;
	},
	'description' | 'descriptionLocalizations'
>;

type ContextMenuOptions = Modify<
	Modify<ContextMenuOptionsX, SanitizedOptions>,
	{
		type: ContextMenuOptionsX['type'] | 'USER' | 'MESSAGE';
	}
>;
