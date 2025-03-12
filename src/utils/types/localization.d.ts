import type { Locale } from 'discord.js';
import type {
	ContextMenu as ContextMenuX,
	NotEmpty,
	Slash as SlashX,
	SlashChoice as SlashChoiceX,
	SlashChoiceType,
	SlashGroup as SlashGroupX,
	SlashOption as SlashOptionX,
} from 'discordx';
import type {
	LiteralToPrimitive,
	LiteralToPrimitiveDeep,
	OptionalKeysOf,
	Or,
	Paths,
	PositiveInfinity,
	RequiredKeysOf,
	Simplify,
	UnionToIntersection,
	UnionToTuple,
} from 'type-fest';
import type { IsLiteral, IsLiteralUnion } from 'type-fest/source/is-literal.js';

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

type ExcludeFromUnion<Union, Exclude> = { [K in keyof Union]: Union[K] extends Exclude ? never : Union[K] };

type p0 = Parameters<typeof SlashChoiceX<>>;
type p1<T extends string = 'p1'> = Parameters<typeof SlashChoiceX<T>>;
type p2<T extends string = 'p2', X = string | number> = Parameters<typeof SlashChoiceX<T, X>>;
type o0 = OverloadedParameters<typeof SlashChoiceX<>>;
type o1<T extends string = 'o1'> = OverloadedParameters<typeof SlashChoiceX<T>>;
type o2<T extends string = 'o2', X = string | number> = OverloadedParameters<typeof SlashChoiceX<T, X>>;
type ExtractReverse<T, U> = U extends T ? T : never;
type ExtractReverse2<T, U> = U extends T ? T : never;
type XX = Extract<o1<'t'>, o0> | ExtractReverse2<o0, o1<'t'>>; // get the rest of o0 that wasnt extracted from o1


type a0 = string[] | number[] | object[];
type a1 = 'a'[] | {name: string}[];

type a0 = string[] | number[] | object[];
type a1 = 'a'[] | { name: string }[];

type RemoveSuperTypes<A0, A1> = A0 extends any 
  ? (Extract<A1, A0> extends never ? A0 : never)
  : never;

type a2 = Extract<a1, a0> | RemoveSuperTypes<a0, a1>;
/////
type a0 = string[] | number[] | object[];
type a1 = 'a'[] | { name: string }[] | bigint[];

// Returns those types in A0 that are not "covered" by any type in A1.
type RemoveSuperTypes<A0, A1> = A0 extends any 
  ? (Extract<A1, A0> extends never ? A0 : never)
  : never;

// Returns those types in A1 that are not assignable to any member of A0.
type UniqueInA1<A1, A0> = A1 extends any 
  ? (Extract<A0, A1> extends never ? A1 : never)
  : never;

// Combine the common specialized types, the remaining types from A0, and the unique types from A1.
type a2 = Extract<a1, a0> | RemoveSuperTypes<a0, a1> | UniqueInA1<a1, a0>;



type XX1 = Exclude<f4, f2&f4>; // never
type YY1 = NotEmpty<'ttt'>[] extends string[] ? true : false;
//type test1 = ExcludeFromUnion<string[] | number[], NotEmpty<'t'>[]>
//type test2 = Exclude<string[] | number[], string[]>

type ArrayType<T> = T extends (infer U)[] ? U : never;
type ArrayIntersection<Literal, Primitive> = (ArrayType<Literal> & ArrayType<Primitive>)[];

type bd = MostSpecificArr3<o1, o0>; // number[] | "o1" | object<"o1", default>
type bd1 = bd

type f3 = SlashChoiceType<"o1">[] extends SlashChoiceType<string, unknown>[] ? true : false
type f2 = SlashChoiceType<"o1">[]
type f4 = SlashChoiceType<string, unknown>[]
type f1 = Exclude<f2, f4>

type uu<T> = T extends infer U ? U : never;
type u1 = Exclude<uu<NotEmpty<'ttt'>[]>, string[]>
type u2 = uu<SlashChoiceType<string, unknown>>

type MostSpecificArr3<MoreSpecific, LessSpecific> = MoreSpecific extends LessSpecific ? MoreSpecific : LessSpecific
type MostSpecificArr2<MoreSpecific, LessSpecific> = ArrayType<MoreSpecific> | Exclude<ArrayType<LessSpecific>, LiteralToPrimitive<ArrayType<MoreSpecific>>>;
type MostSpecificArr<MoreSpecific, LessSpecific> = ArrayType<(MoreSpecific & LessSpecific) | Exclude<LessSpecific, LiteralToPrimitive<(MoreSpecific & LessSpecific)>>>;

type r5<t1, t2> = (t1 & t2 & string)
type r6 = r5<'ttt', number>

// Example usage:
type Test1 = MostSpecific<'ttt', string | number>; // Expected: "ttt" | number
type Test2 = MostSpecific<number | 42 | string | 'hello'>; // Expected: 42 | "hello"
type Test3 = MostSpecific<boolean | true | 'yes'>; // Expected: true | "yes"

type t1 = NotEmpty<'ttt'>[] extends string[] ? true : false;
type t2 = ArrayIntersection<NotEmpty<'ttt'>[] | number[], NotEmpty<'ttt'>[] | string[] | number[]>;
type t3 = ArrayIntersection<'ttt'[] | string[] | number[], 'ttt'[] | string[] | number[]>;

type b<T extends string = 't', X = string | number> = ArrayIntersection<
	| OverloadedParameters<typeof SlashChoiceX<T, X> | typeof SlashChoiceX<T>>
	| OverloadedParameters<typeof SlashChoiceX<>>,
	OverloadedParameters<typeof SlashChoiceX<T>> | OverloadedParameters<typeof SlashChoiceX<>>
>;

type c = b;
