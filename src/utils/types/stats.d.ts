import type { Stats } from '@/services';

export type StatPerInterval = {
	date: string;
	count: number;
}[];

export type StatsResolverType = {
	name: string;
	data: (statsHelper: Stats, days: number) => Promise<StatPerInterval>;
}[];
