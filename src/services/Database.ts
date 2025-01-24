import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import {
	type EntityName,
	EntityRepository,
	type GetRepository,
	MikroORM,
	type Options,
} from '@mikro-orm/core';
import fastFolderSize from 'fast-folder-size';
import { backup, restore } from 'saveqlite';
import { delay, inject } from 'tsyringe';

import { databaseConfig, mikroORMConfig } from '@/configs';
import * as entities from '@/entities';
import env from '@/env';
import { Logger, PluginsManager, Store } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	dayjsTimezone,
	formatDate,
	resolveDependency,
} from '@/utils/functions';
import type {
	DatabaseDriver,
	DatabaseEntityManager,
	DatabaseSize,
} from '@/utils/types';

@Service()
export class Database {
	private _orm!: MikroORM<DatabaseDriver>;

	constructor(
		@inject(delay(() => Store)) private store: Store,
		@inject(delay(() => Logger)) private logger: Logger,
	) {}

	async initialize() {
		const pluginsManager = await resolveDependency(PluginsManager);

		// get config
		const config = mikroORMConfig[env.NODE_ENV] as Options<DatabaseDriver>;

		// defines entities into the config
		config.entities = [
			...Object.values(entities),
			...pluginsManager.getEntities(),
		] as keyof typeof config.entities;

		// initialize the ORM using the configuration exported in `mikro-orm.config.ts`
		this._orm = await MikroORM.init(config);

		const shouldMigrate = !this.store.get('botHasBeenReloaded');
		if (shouldMigrate) {
			const migrator = this._orm.getMigrator();

			// create migration if no one is present in the migrations folder
			const pendingMigrations = await migrator.getPendingMigrations();
			const executedMigrations = await migrator.getExecutedMigrations();
			if (pendingMigrations.length === 0 && executedMigrations.length === 0)
				await migrator.createInitialMigration();

			// migrate to the latest migration
			await this._orm.getMigrator().up();
		}
	}

	async refreshConnection() {
		await this._orm.close();
		this._orm = await MikroORM.init();
	}

	get orm(): MikroORM<DatabaseDriver> {
		return this._orm;
	}

	get em(): DatabaseEntityManager {
		return this._orm.em;
	}

	/**
	 * Shorthand to get custom and natives repositories
	 * @param entity Entity of the custom repository to get
	 */
	get<T extends object>(
		entity: EntityName<T>,
	): GetRepository<T, EntityRepository<T>> {
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

		try {
			await backup(
				mikroORMConfig[env.NODE_ENV].dbName ?? '',
				`${snapshotName}.txt`,
				`${join(databaseConfig.path, 'backups', 'objects')}/`,
			);

			return true;
		} catch (e) {
			const errorMessage =
				typeof e === 'string' ? e : e instanceof Error ? e.message : String(e);
			await this.logger.log(
				'error',
				`Couldn't backup database: ${errorMessage}`,
			);
			return false;
		}
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

		if (!databaseConfig.path)
			await this.logger.log(
				'error',
				"Database path not set, couldn't restore backup",
			);

		try {
			await restore(
				mikroORMConfig[env.NODE_ENV].dbName ?? '',
				join(databaseConfig.path, 'backups', snapshotName),
			);
			await this.refreshConnection();
			return true;
		} catch {
			await this.logger.log(
				'error',
				"Snapshot file not found, couldn't restore",
			);
			return false;
		}
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
		const size: DatabaseSize = {
			db: null,
			backups: null,
		};

		if (this.isSQLiteDatabase()) {
			const dbPath = mikroORMConfig[env.NODE_ENV].dbName;
			if (dbPath) {
				const dbSize = (await stat(dbPath)).size;
				size.db = dbSize;
			}
		}

		const backupSize = await promisify(fastFolderSize)(
			join(databaseConfig.path, 'backups'),
		);
		size.backups = backupSize ?? null;

		return size;
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
