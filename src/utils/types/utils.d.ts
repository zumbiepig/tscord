export type Modify<T, R> = Omit<T, keyof R> & R;

export type OmitPick<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type WithOptional<T, K extends keyof T> = OmitPick<T, K> &
	Partial<Pick<T, K>>;
export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
	[Property in Key]-?: Type[Property];
};

export type Primitive = string | number | symbol;

export type GenericObject = Record<Primitive, unknown>;

export type Join<
	L extends Primitive | undefined,
	R extends Primitive | undefined,
> = L extends string | number
	? R extends string | number
		? `${L}.${R}`
		: L
	: R extends string | number
		? R
		: undefined;

export type Union<
	L extends Primitive | undefined,
	R extends Primitive | undefined,
> = L extends undefined
	? R extends undefined
		? undefined
		: R
	: R extends undefined
		? L
		: L | R;

/**
 * NestedPaths
 * Get all the possible paths of an object
 * @example
 * export type Keys = NestedPaths<{ a: { b: { c: string } }>
 * // 'a' | 'a.b' | 'a.b.c'
 */
export type NestedPaths<
	T extends GenericObject,
	Prev extends Primitive | undefined = undefined,
	Path extends Primitive | undefined = undefined,
> = {
	[K in keyof T]: T[K] extends GenericObject
		? NestedPaths<T[K], Union<Prev, Path>, Join<Path, K>>
		: Union<Union<Prev, Path>, Join<Path, K>>;
}[keyof T];

/**
 * TypeFromPath
 * Get the export type of the element specified by the path
 * @example
 * export type TypeOfAB = TypeFromPath<{ a: { b: { c: string } }, 'a.b'>
 * // { c: string }
 */
export type TypeFromPath<
	T extends GenericObject,
	Path extends string, // Or, if you prefer, NestedPaths<T>
> = {
	[K in Path]: K extends keyof T
		? T[K]
		: K extends `${infer P}.${infer S}`
			? T[P] extends GenericObject
				? TypeFromPath<T[P], S>
				: never
			: never;
}[Path];
