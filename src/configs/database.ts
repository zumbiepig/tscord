import path from 'node:path';

// import { MongoDriver } from '@mikro-orm/mongodb';
// import { MariaDbDriver } from '@mikro-orm/mariadb';
// import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';

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
		driver: BetterSqliteDriver,
		dbName: path.join(databaseConfig.path, 'sqlite.db'),

		/**
		 * MongoDB
		 */
		// driver: MongoDriver,
		// clientUrl: env.DATABASE_HOST,

		/**
		 * MariaDB (works with MySQL too)
		 */
		// driver: MariaDbDriver,
		// dbName: env.DATABASE_NAME,
		// host: env.DATABASE_HOST,
		// port: env.DATABASE_PORT,
		// user: env.DATABASE_USER,
		// password: env.DATABASE_PASSWORD,

		/**
		 * PostgreSQL (works with CockroachDB too)
		 */
		// driver: PostgreSqlDriver,
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
	env.NODE_ENV === 'development' ? { ...envConfig.production, ...envConfig.development } : envConfig.production;
