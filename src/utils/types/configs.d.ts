import type { ConnectionOptions, MikroORMOptions } from '@mikro-orm/core';
import type {
	ActivitiesOptions,
	Colors,
	Locale,
	PresenceStatusData,
	Snowflake } from 'discord.js';
import type { SetRequiredDeep, ValueOf } from 'type-fest';

import type { env } from '@/env';
import type { Locales } from '@/i18n';
import type { Timezone } from '@/utils/types';

export interface APIConfigType {
	enabled: boolean;
	port: number;
}

export type ColorsConfigType = { [x in PropertyKey]: ValueOf<typeof Colors> | ColorsConfigType };

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

export interface GeneralConfigType {
	name: string;
	description: string;

	defaultLocale: Extract<`${Locale}`, Locales>;
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

	user: LogsConfigCategoryType;

	guild: LogsConfigCategoryType;
}
