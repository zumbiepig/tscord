import { lstat, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Get the size of a folder in bytes.
 *
 * @param itemPath - Path of the folder.
 *
 * @returns The size of the folder in bytes.
 */
export async function getFolderSize(rootItemPath: string): Promise<number> {
	let folderSize = 0;
	const foundInodes = new Set<number>();

	async function processItem(itemPath: string): Promise<void> {
		const stats = await lstat(itemPath);

		if (!foundInodes.has(stats.ino)) {
			foundInodes.add(stats.ino);
			folderSize += stats.size;
		}

		if (stats.isDirectory()) {
			const directoryItems = await readdir(itemPath);
			await Promise.all(
				directoryItems.map((directoryItem) =>
					processItem(join(itemPath, directoryItem)),
				),
			);
		}
	}

	await processItem(rootItemPath);

	return folderSize;
}
