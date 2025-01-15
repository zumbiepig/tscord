import { constant } from 'case';

/**
 * Ensures value(s) strings and has a size after trim
 * @param strings
 * @returns {boolean} true if all strings are valid
 */
export function validString(...strings: unknown[]): boolean {
	if (strings.length === 0) return false;

	for (const currString of strings) {
		if (!currString) return false;
		if (typeof currString !== 'string') return false;
		if (currString.length === 0) return false;
		if (currString.trim().length === 0) return false;
	}

	return true;
}

export function oneLine(strings: TemplateStringsArray, ...keys: string[]) {
	return strings
		.reduce((result, part, i) => result + part + (keys[i] ?? ''), '')
		.replace(/(?:\n(?:\s*))+/g, ' ')
		.trim();
}

export function numberAlign(number: number, align = 2) {
	return number.toString().padStart(align, ' ');
}

export function constantPreserveDots(string: string) {
	return string
		.split('.')
		.map((word) => constant(word))
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
