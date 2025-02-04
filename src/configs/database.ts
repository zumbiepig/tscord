import { join } from 'node:path';

import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

import type { DatabaseConfigType, MikroORMConfigType } from '@/utils/types';

export const databaseConfig: DatabaseConfigType = {
	path: './database', // path to the folder containing the migrations and SQLite database (if used)
	enableBackups: true, // enabling automated backups of the database (ONLY FOR SQLITE)
};

const envMikroORMConfig: MikroORMConfigType = {
	production: {
		/**
		 * SQLite
		 */
		driver: BetterSqliteDriver,
		dbName: join(databaseConfig.path, 'db.sqlite'),

		/**
		 * MongoDB
		 */
		/* driver: MongoDriver,
		clientUrl: env.DATABASE_HOST, */

		/**
		 * PostgreSQL
		 */
		/* driver: PostgreSqlDriver,
		dbName: env.DATABASE_NAME,
		host: env.DATABASE_HOST,
		port: env.DATABASE_PORT,
		user: env.DATABASE_USER,
		password: env.DATABASE_PASSWORD, */

		/**
		 * MySQL
		 */
		/* driver: MySqlDriver,
		dbName: env.DATABASE_NAME,
		host: env.DATABASE_HOST,
		port: env.DATABASE_PORT,
		user: env.DATABASE_USER,
		password: env.DATABASE_PASSWORD, */

		/**
		 * MariaDB
		 */
		/* driver: MariaDbDriver,
		dbName: env.DATABASE_NAME,
		host: env.DATABASE_HOST,
		port: env.DATABASE_PORT,
		user: env.DATABASE_USER,
		password: env.DATABASE_PASSWORD, */

		highlighter: new SqlHighlighter(),
		debug: false,

		migrations: {
			path: join(databaseConfig.path, 'migrations'),
			emit: 'ts',
			snapshot: true,
		},

		entities: [
			join('src', 'entities', '*.ts'),
			join('src', 'plugins', '*', 'entities', '*.ts'),
		],

		extensions: [Migrator, EntityGenerator],
	},
	development: {
		// leave blank to autofill from production
	},
};

export const mikroORMConfig =
	Object.keys(envMikroORMConfig.development).length === 0
		? { ...envMikroORMConfig, development: envMikroORMConfig.production }
		: envMikroORMConfig;
