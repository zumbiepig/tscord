import { readFile } from 'node:fs/promises';

import type { PackageJson } from 'type-fest';

const packageJson = JSON.parse(await readFile('./package.json', 'utf8')) as PackageJson & {
	tscord: { version: string };
};

export function getPackageJson(): PackageJson {
	return packageJson;
}

export function getTscordVersion(): string {
	return packageJson.tscord.version;
}
