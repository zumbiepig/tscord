import { constantCase } from 'change-case';
import type { ArrayValues, Join, ScreamingSnakeCase, SnakeCase, SnakeCasedProperties, SnakeCasedPropertiesDeep, Split, TupleToObject, TupleToUnion, UnionToTuple } from 'type-fest';

/**
 * Ensures that all strings have a size after trimming
 * @param strings
 * @returns true if all strings are valid
 */
export function validString(...strings: string[]): boolean {
	return (strings.length > 0) && (strings.every(string => string.trim().length > 0));
}

export function numberAlign(number: number, align = 2) {
	return number.toString().padStart(align, ' ');
}

export function constantPreserveDots<S extends string, T extends Split<S, '.'> = Split<S, '.'>>(string: S): Join<{ [K in keyof T]: ScreamingSnakeCase<T[K]> }, '.'> {
	return string
		.split('.')
		.map((word) => constantCase(word))
		.join('.');
}

export function isValidUrl(url: string) {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
