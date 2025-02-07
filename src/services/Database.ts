import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { type EntityName, MikroORM, type Options } from '@mikro-orm/core';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { delay, inject } from 'tsyringe';

import { databaseConfig, mikroORMConfig } from '@/configs';
import * as entities from '@/entities';
import env from '@/env';
import { Logger, PluginsManager, Store } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	backupDatabase,
	dayjsTimezone,
	formatDate,
	getFolderSize,
	restoreDatabase,
} from '@/utils/functions';
import type { DatabaseSize } from '@/utils/types';

@Service()
export class Database {
	private _orm!: MikroORM;
	private mikroORMConfig!: Options;

	constructor(
		@inject(delay(() => Store)) private store: Store,
		@inject(delay(() => Logger)) private logger: Logger,
		@inject(delay(() => PluginsManager)) private pluginsManager: PluginsManager,
	) {
		// set config
		this.mikroORMConfig = {
			...mikroORMConfig[env.NODE_ENV],

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
		};
	}

	async initialize() {
		// initialize the ORM using the configuration exported in `mikro-orm.config.ts`
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

	async refreshConnection() {
		await this._orm.close();
		this._orm = await MikroORM.init(this.mikroORMConfig);
	}

	get orm() {
		return this._orm;
	}

	get em() {
		return this._orm.em;
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
	 */
	@Schedule('0 0 * * *')
	async backup(snapshotName?: string): Promise<boolean> {
		if (!databaseConfig.enableBackups && !snapshotName) return false;

		if (!this.isSQLiteDatabase()) {
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

		if (!snapshotName)
			snapshotName = `snapshot-${formatDate(dayjsTimezone().toDate(), 'onlyDateFileName')}`;

		await backupDatabase(
			mikroORMConfig[env.NODE_ENV].dbName ?? '',
			`${snapshotName}.txt`,
			`${join(databaseConfig.path, 'backups', 'objects')}/`,
		);
		return true;
	}

	/**
	 * Restore the SQLite database from a snapshot file.
	 * @param snapshotName name of the snapshot to restore
	 * @returns true if the snapshot has been restored, false otherwise
	 */
	async restore(snapshotName: string): Promise<boolean> {
		if (!this.isSQLiteDatabase()) {
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

		await restoreDatabase(
			mikroORMConfig[env.NODE_ENV].dbName ?? '',
			join(databaseConfig.path, 'backups', snapshotName),
		);
		await this.refreshConnection();
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
		const backupList = files.filter((file) => /^snapshot-.+\.txt/.exec(file));

		return backupList;
	}

	async getSize(): Promise<DatabaseSize> {
		const dbName = mikroORMConfig[env.NODE_ENV].dbName;
		const backupPath = join(databaseConfig.path, 'backups');
		return {
			db: this.isSQLiteDatabase() ? (await stat(dbName ?? '')).size : null,
			backups: await getFolderSize(backupPath).catch((err: unknown) => {
				if (
					err instanceof Error &&
					(err as NodeJS.ErrnoException).code === 'ENOENT'
				)
					return null;
				else throw err;
			}),
		} satisfies DatabaseSize;
	}

	isSQLiteDatabase(): boolean {
		const config = mikroORMConfig[env.NODE_ENV];
		return (
			'dbName' in config &&
			!!config.dbName &&
			!('port' in config && !!config.port)
		);
	}
}
