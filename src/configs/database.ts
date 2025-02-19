import { join } from 'node:path';

import { env } from '@/env';
import type { DatabaseConfigType, MikroORMConfigType } from '@/utils/types';

export const databaseConfig: DatabaseConfigType = {
	path: './database', // path to the folder containing the migrations and SQLite database (if used)
	enableBackups: true, // enabling automated backups of the database (ONLY FOR SQLITE)
};

const envConfig: MikroORMConfigType = {
	production: {
		/**
		 * SQLite
		 */
		driver: (await import('@mikro-orm/better-sqlite')).BetterSqliteDriver,
		dbName: join(databaseConfig.path, 'sqlite.db'),

		/**
		 * MongoDB
		 */
		// driver: (await import('@mikro-orm/mongodb')).MongoDriver,
		// clientUrl: env.DATABASE_HOST,

		/**
		 * MariaDB (works with MySQL too)
		 */
		// driver: (await import('@mikro-orm/mariadb')).MariaDbDriver,
		// dbName: env.DATABASE_NAME,
		// host: env.DATABASE_HOST,
		// port: env.DATABASE_PORT,
		// user: env.DATABASE_USER,
		// password: env.DATABASE_PASSWORD,

		/**
		 * PostgreSQL (works with CockroachDB too)
		 */
		// driver: (await import('@mikro-orm/postgresql')).PostgreSqlDriver,
		// dbName: env.DATABASE_NAME,
		// host: env.DATABASE_HOST,
		// port: env.DATABASE_PORT,
		// user: env.DATABASE_USER,
		// password: env.DATABASE_PASSWORD,
	},
	development: {
		// put development overrides here
	},
};

export const mikroORMConfig =
	env.NODE_ENV === 'development'
		? { ...envConfig.production, ...envConfig.development }
		: envConfig.production;
