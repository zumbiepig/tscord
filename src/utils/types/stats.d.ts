import type { Stats } from '@/services';
import type { getTypeOfInteraction } from '@/utils/functions';

export type StatType = ReturnType<typeof getTypeOfInteraction>;

export type StatPerInterval = {
	date: string;
	count: number;
}[];

export type StatsResolverType = {
	name: string;
	data: (statsHelper: Stats, days: number) => Promise<StatPerInterval>;
}[];
