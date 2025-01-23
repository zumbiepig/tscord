import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(
	await readFile('package.json', 'utf-8'),
) as Record<string, unknown>;

export function getPackageDotJson() {
	return packageJson;
}

export function getTscordVersion(): string {
	return (packageJson as { tscord: { version: string } }).tscord.version;
}
