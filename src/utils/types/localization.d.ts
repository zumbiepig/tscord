import type { Locale } from 'discord.js';
import type {
	ContextMenu as ContextMenuX,
	Slash as SlashX,
	SlashChoice as SlashChoiceX,
	SlashGroup as SlashGroupX,
	SlashOption as SlashOptionX,
} from 'discordx';
import type { IsEqual, OptionalKeysOf, Or, Paths, PositiveInfinity, RequiredKeysOf, Simplify } from 'type-fest';

import type { Locales, Translations } from '@/i18n';

export type BotLocales = Extract<`${Locale}`, Locales>;

export type TranslationPaths = Paths<Translations, { maxRecursionDepth: PositiveInfinity; leavesOnly: true }>;

export type Sanitization<T extends object | unknown[]> = T extends unknown[]
	? {
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
		}
	: Sanitization<[T]>[0];

export type ContextMenuOptions<T extends string> = Sanitization<Parameters<typeof ContextMenuX<T>>>;

export type SlashOptions<T extends string, TD extends string> = Sanitization<Parameters<typeof SlashX<T, TD>>>;

export type SlashChoiceOptions<T extends string, X = string | number> = Sanitization<
	Parameters<typeof SlashChoiceX<> | typeof SlashChoiceX<T> | typeof SlashChoiceX<T, X>>
>;

export type SlashGroupOptions<T extends string, TD extends string, TR extends string> = Sanitization<
	Parameters<typeof SlashGroupX<T> | typeof SlashGroupX<T, TD> | typeof SlashGroupX<T, TD, TR>>
>;

export type SlashOptionOptions<T extends string, TD extends string> = Sanitization<
	Parameters<typeof SlashOptionX<> | typeof SlashOptionX<T, TD>>
>;

/////////////////////////////

type ValidFunction<Arguments extends unknown[], ReturnType> = (...args: Arguments) => ReturnType;
type Overloads<T extends (...args: unknown[]) => unknown> = T extends {
	(...args: infer A1): infer R1;
	(...args: infer A2): infer R2;
	(...args: infer A3): infer R3;
	(...args: infer A4): infer R4;
	(...args: infer A5): infer R5;
	(...args: infer A6): infer R6;
	(...args: infer A7): infer R7;
	(...args: infer A8): infer R8;
	(...args: infer A9): infer R9;
	(...args: infer A10): infer R10;
	(...args: infer A11): infer R11;
	(...args: infer A12): infer R12;
}
	?
			| ValidFunction<A1, R1>
			| ValidFunction<A2, R2>
			| ValidFunction<A3, R3>
			| ValidFunction<A4, R4>
			| ValidFunction<A5, R5>
			| ValidFunction<A6, R6>
			| ValidFunction<A7, R7>
			| ValidFunction<A8, R8>
			| ValidFunction<A9, R9>
			| ValidFunction<A10, R10>
			| ValidFunction<A11, R11>
			| ValidFunction<A12, R12>
	: never;

type OverloadedParameters<T> = Parameters<Overloads<T>>;

/////////////////////////////

type p0 = Parameters<typeof SlashChoiceX<>>;
type p1<T extends string = 'p1'> = Parameters<typeof SlashChoiceX<T>>;
type p2<T extends string = 'p2', X = 'x'> = Parameters<typeof SlashChoiceX<T, X>>;
type o0 = OverloadedParameters<typeof SlashChoiceX<>>;
type o1<T extends string = 'o1'> = OverloadedParameters<typeof SlashChoiceX<T>>;
type o2<T extends string = 'o2', X = 'x'> = OverloadedParameters<typeof SlashChoiceX<T, X>>;

/////////////////////////////

type XX = RemoveSuperTypesFromTuple<[o1<'t'>, o0, o2<'t'>]>;

///////////////////////////////////
type a0 = 'b'[] | 5[] | string[] | bigint[] | object[];
type a1 = 'a'[] | { name: string }[] | number[] | symbol[];

type RemoveSuperTypesFromTuple2<T extends unknown[]> = T extends [infer U]
	? U
	: RemoveSuperTypesFromTuple2<
			T extends [infer A, infer B, ...infer Rest]
				? [
						(A extends B ? (B extends A ? true : false) : false) extends true
							? Extract<A, B> | Extract<B, A>
							:
									| (A extends unknown ? (Extract<B, A> extends never ? A : never) : never)
									| (B extends unknown ? (Extract<A, B> extends never ? B : never) : never),
						...Rest,
					]
				: []
		>;


// Example usage:
type ExampleTypes0 = [a0, a1];
type ExampleTypes1 = [string[], number[], object[], 'a'[], 'a'[], { name: string }[], bigint[]];
type ExampleTypes4 = [string[], number[], 'a'[], { x: boolean }[]];
type ExampleTypes5 = [{ a: string }[], { a: 'a' }[], { a: 'a' }[], { a: string }[]];
type ExampleTypes6 = [
	{ a: string; b: number }[] | { a: 'a'; b: number }[] | { a: 'a'; b: 2 }[] | { a: string; b: 2 }[],
];
type ExampleTypes7 = ['a'[], never[]];
type ExampleTypes8 = [string[], number[], (string | object)[], (number | object)[]];
type ExampleTypes9 = [string, 'a', number | Date, 42 | Date];
type ExampleTypes2 = [
	OverloadedParameters<typeof SlashChoiceX<>>,
	OverloadedParameters<typeof SlashChoiceX<'t'>>,
	OverloadedParameters<typeof SlashChoiceX<'t', 'x'>>,
];
type ExampleTypes3 = [o1<'t'>, o0, o2<'t'>];

type check = RemoveSuperTypesFromTuple2<ExampleTypes5>;

/////////////////////////////

type ArrayType<T> = T extends (infer U)[] ? U : never;

type b<T extends string = 't', X = 'x'> = RemoveSuperTypesFromTuple<
	[
		OverloadedParameters<typeof SlashChoiceX<>>,
		OverloadedParameters<typeof SlashChoiceX<T>>,
		OverloadedParameters<typeof SlashChoiceX<T, X>>,
	]
>;

type c = b;
