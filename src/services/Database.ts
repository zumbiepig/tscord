import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import {
	DefaultLogger,
	defineConfig,
	type EntityClass,
	type LogContext,
	type Logger as MikroORMLogger,
	type LoggerNamespace,
	type LoggerOptions,
	MikroORM,
	type Options,
} from '@mikro-orm/core';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import chalk from 'chalk';
import { delay, inject } from 'tsyringe';

import { databaseConfig, logsConfig, mikroORMConfig } from '@/configs';
import * as entities from '@/entities';
import { env } from '@/env';
import { Logger, PluginsManager, Store } from '@/services';
import { Schedule, Service } from '@/utils/decorators';
import {
	backupDatabase,
	dayjsTimezone,
	getFolderSize,
	isSQLiteDatabase,
	restoreDatabase,
} from '@/utils/functions';

class CustomLogger extends DefaultLogger implements MikroORMLogger {
	constructor(
		private logger: Logger,
		options: LoggerOptions,
	) {
		super(options);
	}

	override log(
		namespace: LoggerNamespace,
		message: string,
		context?: LogContext,
	): void {
		if (!this.isEnabled(namespace, context)) return;

		message = message.replace(/\n/g, '').replace(/ +/g, ' ').trim();

		const logMessage = `[${namespace}] ${context?.label ? `(${context.label}) ` : ''}${message}`;
		const chalkedLogMessage = `${chalk.grey(`[${namespace}] `)}${context?.label ? chalk.cyan(`(${context.label}) `) : ''}${message}`;

		void this.logger.log(
			context?.level === 'warning'
				? 'warn'
				: context?.level === 'error'
					? 'error'
					: 'debug',
			logMessage,
			chalkedLogMessage,
			logsConfig.database,
		);
	}
}

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
			metadataProvider: TsMorphMetadataProvider,

			debug: env.isDev,
			highlighter: new SqlHighlighter(),
			loggerFactory: (options) => new CustomLogger(this.logger, options),

			extensions: [EntityGenerator, Migrator],
			migrations: {
				path: join(databaseConfig.path, 'migrations'),
			},

			...mikroORMConfig,
		});

		// initialize the ORM using the exported configuration
		this._orm = await MikroORM.init(this.mikroORMConfig);

		if (!this.store.get('botHasBeenReloaded')) {
			// create initial migration if none are present in the migrations folder
			const pendingMigrations = await this._orm.migrator.getPendingMigrations();
			const executedMigrations =
				await this._orm.migrator.getExecutedMigrations();
			if (pendingMigrations.length === 0 && executedMigrations.length === 0)
				await this._orm.migrator.createInitialMigration();

			// migrate to the latest migration
			if (await this._orm.migrator.checkMigrationNeeded()) {
				await this._orm.migrator.createMigration();
				await this._orm.migrator.up();
			}
		}
	}

	get em() {
		return this._orm.em;
	}

	/**
	 * Shorthand to get custom and natives repositories
	 * @param entity Entity of the custom repository to get
	 */
	get<T extends object>(entity: EntityClass<T>) {
		return this.em.getRepository(entity);
	}

	/**
	 * Create a snapshot of the database each day at 00:00
	 * @param snapshotFile name of the snapshot to create
	 */
	@Schedule('0 0 * * *')
	async backupDb(snapshotFile?: string): Promise<boolean> {
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
			snapshotFile = `snapshot_${dayjsTimezone().format('YYYY-MM-DD_HH-mm-ss')}_${mikroORMConfig.dbName ?? ''}.backup`;

		await this.em.flush();
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
	async restoreDb(snapshotFile: string): Promise<boolean> {
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

	async getBackupList() {
		if (!databaseConfig.path) {
			await this.logger.log(
				'error',
				"Database path not set, couldn't get list of backups",
			);
			return;
		}

		const files = await readdir(join(databaseConfig.path, 'backups'));
		const backupList = files.filter((file) => /^.+\.db\.backup$/.exec(file));

		return backupList;
	}

	async getSize() {
		const backupPath = join(databaseConfig.path, 'backups');
		return {
			db:
				isSQLiteDatabase() && mikroORMConfig.dbName
					? (await stat(mikroORMConfig.dbName)).size
					: undefined,
			backups: await getFolderSize(backupPath).catch((err: unknown) => {
				if (
					err instanceof Error &&
					(err as NodeJS.ErrnoException).code === 'ENOENT'
				)
					return undefined;
				else throw err;
			}),
		};
	}
}
