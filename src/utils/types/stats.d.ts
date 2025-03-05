import type { getTypeOfInteraction } from '@/utils/functions';
import type { Snowflake } from 'discord.js';

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

export interface StatAdditionalData {
	user?: Snowflake | undefined;
	guild?: Snowflake | undefined;
	channel?: Snowflake | undefined;
}

export type StatPerInterval = {
	date: Date;
	count: number;
}[];
