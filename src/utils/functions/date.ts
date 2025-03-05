import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import { generalConfig } from '@/configs';

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);

dayjs.tz.setDefault(generalConfig.timezone);

export const dayjsTimezone = dayjs.tz;

export function timeAgo(
	date?: dayjs.ConfigType,
	unit?: dayjs.QUnitType | dayjs.OpUnitType,
	float?: boolean,
): number {
	return dayjsTimezone().diff(date, unit, float);
}
