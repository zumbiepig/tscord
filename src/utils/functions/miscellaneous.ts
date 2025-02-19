import type { PackageJson } from 'type-fest';

import packageJson from '../../../package.json';

export function getPackageJson(): PackageJson {
	return packageJson as PackageJson;
}

export function getTscordVersion(): string {
	return packageJson.tscord.version;
}
