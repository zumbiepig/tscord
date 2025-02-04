import { createHash } from 'node:crypto';
import { createReadStream, type PathLike } from 'node:fs';
import { lstat, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Get the size of a folder in bytes.
 *
 * @param itemPath - Path of the folder.
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

/**
 * Get the SHA-256 hash of a file.
 *
 * @param path - Path of the file.
 * @returns The SHA-256 hash of the file.
 */
export async function getFileHash(path: PathLike): Promise<string> {
	return new Promise((resolve, reject) => {
		const hash = createHash('sha256');
		const stream = createReadStream(path);
		stream.on('error', reject);
		stream.on('data', (chunk) => { hash.update(chunk) });
		stream.on('end', () => { resolve(hash.digest('hex')) });
	});
}
