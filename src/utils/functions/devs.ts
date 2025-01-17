import type { UserResolvable } from 'discord.js';

import { generalConfig } from '@/configs';

/**
 * Get a curated list of devs including the owner id
 */
export function getDevs(): UserResolvable[] {
	return [
		...new Set([
			...(generalConfig.ownerId ? [generalConfig.ownerId] : []),
			...(generalConfig.devs ?? []),
		]),
	];
}

/**
 * Check if a given user is a dev with its ID
 * @param id Discord user id
 */
export function isDev(id: string): boolean {
	return getDevs().includes(id);
}
