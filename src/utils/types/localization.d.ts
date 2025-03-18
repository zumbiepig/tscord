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
import type { OverloadParameters } from '@/utils/types';

export type BotLocales = Extract<`${Locale}`, Locales>;

export type TranslationPaths = Paths<Translations, { maxRecursionDepth: PositiveInfinity; leavesOnly: true }>;

export type ContextMenuOptions<T extends string> = LocalizedOptions<OverloadParameters<[typeof ContextMenuX<T>]>>;
export type SlashOptions<T extends string, TD extends string> = LocalizedOptions<
	OverloadParameters<[typeof SlashX<>, typeof SlashX<T, TD>]>
>;
export type SlashChoiceOptions<T extends string, X = string | number> = LocalizedOptions<
	OverloadParameters<[typeof SlashChoiceX<T>, typeof SlashChoiceX<>, typeof SlashChoiceX<T, X>]>
>;
export type SlashGroupOptions<T extends string, TD extends string, TR extends string> = LocalizedOptions<
	OverloadParameters<[typeof SlashGroupX<T>, typeof SlashGroupX<T, TD>, typeof SlashGroupX<T, TD, TR>]>
>;
export type SlashOptionOptions<T extends string, TD extends string> = LocalizedOptions<
	OverloadParameters<[typeof SlashOptionX<>, typeof SlashOptionX<T, TD>]>
>;

export type LocalizedOptions<T extends object | unknown[]> = T extends unknown[]
	? {
			[K in keyof T]: T[K] extends infer U
				? U extends object
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
						: U
					: U
				: never;
		}
	: LocalizedOptions<[T]>[0];
