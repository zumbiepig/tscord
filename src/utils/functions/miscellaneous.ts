import type { PackageJson } from 'type-fest';

import packageJson from '../../../package.json' assert { type: 'json' };

export function getPackageJson() {
	return packageJson as PackageJson;
}

export function getTscordVersion(): string {
	return (packageJson as PackageJson & { tscord: { version: string } }).tscord
		.version;
}
