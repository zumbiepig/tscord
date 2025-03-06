import type { ApplicationCommandType,	LocalizationMap,Locale} from 'discord.js';
import type {
	ApplicationCommandOptions as ApplicationCommandOptionsX,
	ContextMenu as ContextMenuX,
	NotEmpty as NotEmptyX,
	Slash as SlashX,
	SlashChoice as SlashChoiceX,
	SlashGroup as SlashGroupX,
	SlashOption as SlashOptionX,
	SlashChoiceOptions as SlashChoiceOptionsX,
	SlashGroupOptions as SlashGroupOptionsX,
	SlashOptionOptions as SlashOptionOptionsX,
	SlashGroupBase,
} from 'discordx';
import type {
	Except,
	Get,
	OverrideProperties,
	Paths,
	PositiveInfinity,
	SetOptional,
	Simplify,Replace
} from 'type-fest';

import type { Locales, Translations } from '@/i18n';

export type BotLocales = Extract<`${Locale}`, Locales>;

export type TranslationPaths = Paths<Translations, { maxRecursionDepth: PositiveInfinity, leavesOnly: true }>;

export type SanitizedOptions = {
	localizationSource: Replace<Extract<TranslationPaths, `${string}.NAME`>, '.NAME', ''>&Replace<Extract<TranslationPaths, `${string}.DESCRIPTION`>, '.DESCRIPTION', ''>;
}

type Sanitization<T extends SlashGroupBase> = Omit<T, 'nameLocalizations' | 'descriptionLocalizations'> & OverrideProperties<T, SanitizedOptions>;

export type ContextMenuOptions = Sanitization<Parameters<typeof ContextMenuX>[0]>

export type SlashOptions = Sanitization<Parameters<typeof SlashX>[0]>;

export type SlashChoiceOptions = Sanitization<Parameters<typeof SlashChoiceX>[0]>;

export type SlashGroupOptions = Sanitization<Parameters<typeof SlashGroupX>[0]>;

export type SlashOptionOptions = Sanitization<Parameters<typeof SlashOptionX>[0]>;
