import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';

/**
 * Change a date timezone to the one defined in the config.
 * @param date
 * @param tzString
 */

export function convertTZ(date: Date, tzString: string): Date {
	return new Date(
		(typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', {
			timeZone: tzString,
		}),
	);
}

/**
 * Function to encode file data to base64 encoded string
 * @param file - file to encode
 */
export async function base64Encode(file: string) {
	// read binary data
	const bitmap = await readFile(file);

	// convert binary data to base64 encoded string
	return Buffer.from(bitmap).toString('base64');
}
