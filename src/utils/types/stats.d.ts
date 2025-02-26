import type { getTypeOfInteraction } from '@/utils/functions';

export type StatType =
	| ReturnType<typeof getTypeOfInteraction>
	| 'NEW_GUILD'
	| 'RECOVER_GUILD'
	| 'DELETE_GUILD'
	| 'NEW_USER'
	| 'RECOVER_USER'
	| 'DELETE_USER'
	| 'TOTAL_USERS'
	| 'TOTAL_GUILDS'
	| 'TOTAL_ACTIVE_USERS'
	| 'TOTAL_COMMANDS';

export type StatPerInterval = {
	date: Date;
	count: number;
}[];
