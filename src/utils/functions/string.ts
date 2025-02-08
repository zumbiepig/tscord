import { constantCase } from 'change-case';

/**
 * Ensures value(s) strings and has a size after trim
 * @param strings
 * @returns {boolean} true if all strings are valid
 */
export function validString(...strings: unknown[]): boolean {
	if (strings.length === 0) return false;

	for (const string of strings) {
		if (!string || typeof string !== 'string' || string.trim().length === 0)
			return false;
	}

	return true;
}

export function numberAlign(number: number, align = 2) {
	return number.toString().padStart(align, ' ');
}

export function constantPreserveDots(string: string) {
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
