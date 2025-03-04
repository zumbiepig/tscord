import type { ConnectionOptions, MikroORMOptions } from '@mikro-orm/core';
import type {
	ActivitiesOptions,
	Colors,
	Locale,
	PresenceStatusData,
	Snowflake } from 'discord.js';
import type { SetRequiredDeep, ValueOf } from 'type-fest';

import type { env } from '@/env';
import type { Timezone } from '@/utils/types';

export interface GeneralConfigType {
	name: string;
	description: string;

	defaultLocale: `${Locale}`;
	timezone: Timezone;

	simpleCommandsPrefix: string | undefined;
	automaticDeferring: boolean;

	ownerId: Snowflake | undefined;
	devs: Snowflake[];
	testGuildId: Snowflake | undefined;

	activities: ActivitiesOptions[] & { status: PresenceStatusData }[];

	automaticUploadImagesToImgur: boolean;

	links: {
		botInvite: string | undefined;
		supportServer: string | undefined;
		gitRepo: string | undefined;
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
	channelId: Snowflake | undefined;
}

export interface LogsConfigType {
	logTailMaxSize: number;

	archive: {
		enabled: boolean;
		retentionDays: number;
	};

	system: LogsConfigCategoryType;

	error: LogsConfigCategoryType;

	database: LogsConfigCategoryType;

	interaction: LogsConfigCategoryType;

	newUser: LogsConfigCategoryType;

	guild: LogsConfigCategoryType;
}

export interface APIConfigType {
	enabled: boolean;
	port: number;
}

export type ColorsConfigType = Record<string, ValueOf<typeof Colors>>;
