import type { SqlEntityManager, SqliteDriver } from '@mikro-orm/sqlite';

interface DatabaseSize {
	db: number | null;
	backups: number | null;
}

type DatabaseDriver = SqliteDriver;
type DatabaseEntityManager = SqlEntityManager;

interface DataType {
	maintenance: boolean;
	lastMaintenance: number;
	lastStartup: number;
}
