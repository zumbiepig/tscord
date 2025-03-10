import { constantCase } from 'change-case';
import type { Join, ScreamingSnakeCase, Split } from 'type-fest';

/**
 * Ensures that all strings have a size after trimming
 * @param strings an array of strings to test
 * @returns true if all strings are valid
 */
export function validString(...strings: string[]): boolean {
	return strings.length > 0 && strings.every((string) => string.trim().length > 0);
}

/**
 * Checks if the string is a valid command/option name in discord
 * @param string string to test against regex
 * @returns true if the string is a valid discord name
 */
export function isValidDiscordName(string: string) {
	return /^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u.test(string);
}

export function numberAlign(number: number, align = 2) {
	return number.toString().padStart(align, ' ');
}

export function constantPreserveDots<S extends string, T extends Split<S, '.'> = Split<S, '.'>>(
	string: S,
): Join<{ [K in keyof T]: ScreamingSnakeCase<T[K]> }, '.'> {
	return string
		.split('.')
		.map((word) => constantCase(word))
		.join('.') as Join<{ [K in keyof T]: ScreamingSnakeCase<T[K]> }, '.'>;
}

export function isValidUrl(url: string) {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
