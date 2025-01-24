import type { SqlEntityManager, SqliteDriver } from '@mikro-orm/sqlite';

export interface DatabaseSize {
	db: number | null;
	backups: number | null;
}

export type DatabaseDriver = SqliteDriver;
export type DatabaseEntityManager = SqlEntityManager;

export interface DataType {
	maintenance: boolean;
	lastMaintenance: number;
	lastStartup: number;
}
