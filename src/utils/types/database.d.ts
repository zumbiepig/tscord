import type { BetterSqliteDriver, SqlEntityManager } from '@mikro-orm/better-sqlite';

export interface DatabaseSize {
	db: number | null;
	backups: number | null;
}

export type DatabaseDriver = BetterSqliteDriver;
export type DatabaseEntityManager = SqlEntityManager;

export interface DataType {
	maintenance: boolean;
	lastMaintenance: number;
	lastStartup: number;
}
