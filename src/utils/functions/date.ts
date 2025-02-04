import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import { generalConfig } from '@/configs';
import type { Timezone } from '@/utils/types';

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);

dayjs.tz.setDefault(generalConfig.timezone);

export const dayjsTimezone = dayjs.tz;

const dateMasks = {
	default: 'DD/MM/YYYY - HH:mm:ss',
	onlyDate: 'DD/MM/YYYY',
	onlyDateFileName: 'YYYY-MM-DD',
	logs: 'YYYY-MM-DD HH:mm:ss',
};

/**
 * Format a date object to a templated string using the [dayjs](https://www.npmjs.com/package/dayjs) library.
 * @param date
 * @param mask - template for the date format
 * @returns formatted date
 */
export function formatDate(
	date?: dayjs.ConfigType,
	mask: keyof typeof dateMasks = 'default',
) {
	return dayjsTimezone(date).format(dateMasks[mask]);
}

export function timeAgo(
	date?: dayjs.ConfigType,
	unit?: dayjs.QUnitType | dayjs.OpUnitType,
	float?: boolean,
): number {
	return dayjsTimezone().diff(date, unit, float);
}

/**
 * Change a Date to a different timezone.
 * @param date
 * @param timezone
 */
export function convertTZ(
	date: Date,
	timezone: Timezone,
): Date {
	return new Date(
		date.toLocaleString(generalConfig.defaultLocale, {
			timeZone: timezone,
		}),
	);
}
