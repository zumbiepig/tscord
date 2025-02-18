import type { ConnectionOptions, MikroORMOptions } from '@mikro-orm/core';
import type {
	ActivitiesOptions,
	Colors,
	PresenceStatusData,
	Snowflake,
} from 'discord.js';
import type { SetRequiredDeep, ValueOf } from 'type-fest';

import type { env } from '@/env';
import type { Locales } from '@/i18n';
import type { Timezone } from '@/utils/types';

export interface GeneralConfigType {
	name: string;
	description: string;

	defaultLocale: Locales;
	timezone: Timezone;

	simpleCommandsPrefix: string | null;
	automaticDeferring: boolean;

	ownerId: Snowflake | null;
	devs: Snowflake[];
	testGuildId: Snowflake | null;

	activities: ActivitiesOptions[] & { status: PresenceStatusData }[];

	automaticUploadImagesToImgur: boolean;

	links: {
		botInvite: string | null;
		supportServer: string | null;
		gitRepo: string | null;
	};
}

export interface DatabaseConfigType {
	path: string;
	enableBackups: boolean;
}

export type MikroORMConfigType = SetRequiredDeep<
	Record<
		typeof env.NODE_ENV,
		Pick<MikroORMOptions, 'driver'> & ConnectionOptions
	>,
	'production.driver'
>;

interface LogsConfigCategoryType {
	console: boolean;
	file: boolean;
	channelId: Snowflake | null;
}

export interface LogsConfigType {
	logTailMaxSize: number;

	archive: {
		enabled: boolean;
		retentionDays: number;
	};

	system: LogsConfigCategoryType;

	error: LogsConfigCategoryType;

	interaction: LogsConfigCategoryType;

	newUser: LogsConfigCategoryType;

	guild: LogsConfigCategoryType;
}

export interface APIConfigType {
	enabled: boolean;
	port: number;
}

export type ColorsConfigType = Record<string, ValueOf<typeof Colors>>;
