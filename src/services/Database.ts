import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { defineConfig, type EntityName, MikroORM, type Options } from '@mikro-orm/core';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import type { MariaDbDriver } from '@mikro-orm/mariadb';
import { Migrator } from '@mikro-orm/migrations';
import type { MongoDriver } from '@mikro-orm/mongodb';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { delay, inject } from 'tsyringe';

import { databaseConfig, mikroORMConfig } from '@/configs';
import * as entities from '@/entities';
import { env } from '@/env';
import { Logger, PluginsManager, Store } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	backupDatabase,
	dayjsTimezone,
	formatDate,
	getFolderSize,
	isSQLiteDatabase,
	restoreDatabase,
} from '@/utils/functions';

@Service()
export class Database {
	private _orm!: MikroORM;
	private mikroORMConfig!: Options;

	constructor(
		@inject(delay(() => Store)) private store: Store,
		@inject(delay(() => Logger)) private logger: Logger,
		@inject(delay(() => PluginsManager)) private pluginsManager: PluginsManager,
	) {}

	async init() {
		// set config
		this.mikroORMConfig = defineConfig({
			entities: [
				...Object.values(entities),
				...this.pluginsManager.getEntities(),
			],

			debug: env.isDev,
			highlighter: new SqlHighlighter(),

			extensions: [EntityGenerator, Migrator],
			migrations: {
				path: join(databaseConfig.path, 'migrations'),
			},

			...mikroORMConfig,
		});

		// initialize the ORM using the exported configuration
		this._orm = await MikroORM.init(this.mikroORMConfig);

		if (!this.store.get('botHasBeenReloaded')) {
			const migrator = this._orm.getMigrator();

			// create initial migration if none are present in the migrations folder
			const pendingMigrations = await migrator.getPendingMigrations();
			const executedMigrations = await migrator.getExecutedMigrations();
			if (pendingMigrations.length === 0 && executedMigrations.length === 0)
				await migrator.createInitialMigration();

			// migrate to the latest migration
			if (await migrator.checkMigrationNeeded())
				await this._orm.getMigrator().up();
		}
	}

	get em() {
		return (
			this._orm as MikroORM<
				BetterSqliteDriver | MongoDriver | MariaDbDriver | PostgreSqlDriver
			>
		).em;
	}

	/**
	 * Shorthand to get custom and natives repositories
	 * @param entity Entity of the custom repository to get
	 */
	get<T extends object>(entity: EntityName<T>) {
		return this._orm.em.getRepository(entity);
	}

	/**
	 * Create a snapshot of the database each day at 00:00
	 * @param snapshotFile name of the snapshot to create
	 */
	@Schedule('0 0 * * *')
	async backup(snapshotFile?: string): Promise<boolean> {
		if (!databaseConfig.enableBackups && !snapshotFile) return false;

		if (!isSQLiteDatabase()) {
			await this.logger.log('warn', "Database is not SQLite, couldn't backup");
			return false;
		}

		if (!databaseConfig.path) {
			await this.logger.log(
				'error',
				"Database path not set, couldn't backup database",
			);
			return false;
		}

		if (!snapshotFile)
			snapshotFile = `snapshot_${formatDate(dayjsTimezone(), 'dbBackup')}_${mikroORMConfig.dbName ?? ''}.backup`;

		await this._orm.em.flush();
		await backupDatabase(
			mikroORMConfig.dbName ?? '',
			join(databaseConfig.path, 'backups', snapshotFile),
			join(databaseConfig.path, 'backups', 'objects'),
		);
		return true;
	}

	/**
	 * Restore the SQLite database from a snapshot file.
	 * @param snapshotFile name of the snapshot to restore
	 * @returns true if the snapshot has been restored, false otherwise
	 */
	async restore(snapshotFile: string): Promise<boolean> {
		if (!isSQLiteDatabase()) {
			await this.logger.log(
				'error',
				"Database is not SQLite, couldn't restore",
			);
			return false;
		}

		if (!databaseConfig.path) {
			await this.logger.log(
				'error',
				"Database path not set, couldn't restore backup",
			);
			return false;
		}

		await stat(join(databaseConfig.path, 'backups', snapshotFile)).catch(
			async () => {
				await this.logger.log(
					'error',
					`Snapshot ${snapshotFile} does not exist, couldn't restore backup`,
				);
				return false;
			},
		);

		await this._orm.close();
		await restoreDatabase(
			mikroORMConfig.dbName ?? '',
			join(databaseConfig.path, 'backups', snapshotFile),
			join(databaseConfig.path, 'backups', 'objects'),
		);
		await this.init();
		return true;
	}

	async getBackupList(): Promise<string[] | null> {
		if (!databaseConfig.path) {
			await this.logger.log(
				'error',
				"Database path not set, couldn't get list of backups",
			);
			return null;
		}

		const files = await readdir(join(databaseConfig.path, 'backups'));
		const backupList = files.filter((file) => /^.+\.db\.backup$/.exec(file));

		return backupList;
	}

	async getSize() {
		const backupPath = join(databaseConfig.path, 'backups');
		return {
			db: isSQLiteDatabase()
				? (await stat(mikroORMConfig.dbName ?? '')).size
				: null,
			backups: await getFolderSize(backupPath).catch((err: unknown) => {
				if (
					err instanceof Error &&
					(err as NodeJS.ErrnoException).code === 'ENOENT'
				)
					return null;
				else throw err;
			}),
		};
	}
}
