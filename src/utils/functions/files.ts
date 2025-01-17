import { Glob } from 'bun';

/**
 * Resolve all file paths from a directory from a glob pattern
 * @param globPattern - see [here](https://bun.sh/docs/api/glob) for valid glob syntax
 * @param root - root directory to start searching from, relative to import.meta.dir
 */
export async function resolve(
	globPattern: string,
	root?: string,
): Promise<string[]> {
	return await Array.fromAsync(new Glob(globPattern).scan(root));
}

/**
 * Resolve all file paths from a directory from a glob pattern synchronously
 * @param globPattern - see [here](https://bun.sh/docs/api/glob) for valid glob syntax
 * @param root - root directory to start searching from, relative to import.meta.dir
 */
export function resolveSync(globPattern: string, root?: string): string[] {
	return Array.from(new Glob(globPattern).scanSync(root));
}
