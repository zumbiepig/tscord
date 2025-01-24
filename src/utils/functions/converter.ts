import { readFile } from "node:fs/promises";

/**
 * Function to encode file data to base64 encoded string
 * @param file - file to encode
 */
export async function base64Encode(file: string): Promise<string> {
	// read binary data
	const bitmap = await readFile(file);

	// convert binary data to base64 encoded string
	return Buffer.from(bitmap).toString('base64');
}
