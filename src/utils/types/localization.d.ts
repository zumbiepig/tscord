import type { Locale } from 'discord.js';
import type {
	ContextMenu as ContextMenuX,
	Slash as SlashX,
	SlashChoice as SlashChoiceX,
	SlashGroup as SlashGroupX,
	SlashOption as SlashOptionX,
} from 'discordx';
import type { OptionalKeysOf, Or, Paths, PositiveInfinity, RequiredKeysOf, Simplify } from 'type-fest';

import type { Locales, Translations } from '@/i18n';

export type BotLocales = Extract<`${Locale}`, Locales>;

export type TranslationPaths = Paths<Translations, { maxRecursionDepth: PositiveInfinity; leavesOnly: true }>;

export type Sanitization<T extends object|unknown[]> = T extends unknown[] ? {
	[K in keyof T]: T[K] extends object
		? Or<
				'name' | 'nameLocalizations' extends keyof T[K] ? true : false,
				'description' | 'descriptionLocalizations' extends keyof T[K] ? true : false
			> extends true
			? Simplify<
					Omit<
						T[K],
						| ('name' | 'nameLocalizations' extends keyof T[K] ? 'name' | 'nameLocalizations' : never)
						| ('description' | 'descriptionLocalizations' extends keyof T[K]
								? 'description' | 'descriptionLocalizations'
								: never)
					> &
						(('name' | 'nameLocalizations' extends keyof T[K]
							? 'name' extends RequiredKeysOf<T[K]>
								? { nameLocalizations: TranslationPaths }
								: 'name' extends OptionalKeysOf<T[K]>
									? { nameLocalizations?: TranslationPaths }
									: never
							: unknown) &
							('description' | 'descriptionLocalizations' extends keyof T[K]
								? 'description' extends RequiredKeysOf<T[K]>
									? { descriptionLocalizations: TranslationPaths }
									: 'description' extends OptionalKeysOf<T[K]>
										? { descriptionLocalizations?: TranslationPaths }
										: never
								: unknown))
				>
			: T[K]
		: T[K];
} : Sanitization<[T]>[0];

type aaa<T extends string> = {[K in keyof T]: T[K]};
type bbb = Sanitization<Parameters<typeof ContextMenuX<T>>[0]>;

export type ContextMenuOptions<T extends string> = Sanitization<Parameters<typeof ContextMenuX<T>>>;

export type SlashOptions<T extends string, TD extends string> = Sanitization<Parameters<typeof SlashX<> | typeof SlashX<T, TD>>>;

export type SlashChoiceOptions<T extends string, X = string | number> = Sanitization<Parameters<
	typeof SlashChoiceX<> | typeof SlashChoiceX<T> | typeof SlashChoiceX<T, X>
>>;

export type SlashGroupOptions<T extends string, TD extends string, TR extends string> = Sanitization<Parameters<
	typeof SlashGroupX<T> | typeof SlashGroupX<T, TD> | typeof SlashGroupX<T, TD, TR>
>>;

export type SlashOptionOptions<T extends string, TD extends string> = Sanitization<Parameters<
	typeof SlashOptionX<> | typeof SlashOptionX<T, TD>
>>;
