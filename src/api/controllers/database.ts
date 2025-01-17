import { BodyParams, Controller, Get, Post, UseBefore } from '@tsed/common';
import { InternalServerError } from '@tsed/exceptions';
import { Required } from '@tsed/schema';

import { DevAuthenticated } from '@/api/middlewares';
import { databaseConfig } from '@/configs';
import { Database } from '@/services';
import { BaseController } from '@/utils/classes';
import { Injectable } from '@/utils/decorators';
import { formatDate, resolveDependencies } from '@/utils/functions';

@Controller('/database')
@UseBefore(DevAuthenticated)
@Injectable()
export class DatabaseController extends BaseController {
	private db!: Database;

	constructor() {
		super();

		void resolveDependencies([Database]).then(([db]) => {
			this.db = db;
		});
	}

	@Post('/backup')
	async generateBackup() {
		const snapshotName = `snapshot-${formatDate(new Date(), 'onlyDateFileName')}-manual-${Date.now().toString()}`;
		const success = await this.db.backup(snapshotName);

		if (success) {
			return {
				message: 'Backup generated',
				data: {
					snapshotName: `${snapshotName}.txt`,
				},
			};
		} else {
			throw new InternalServerError(
				"Couldn't generate backup, see the logs for more information",
			);
		}
	}

	@Post('/restore')
	async restoreBackup(
		@Required() @BodyParams('snapshotName') snapshotName: string,
	) {
		const success = await this.db.restore(snapshotName);

		if (success) return { message: 'Backup restored' };
		else
			throw new InternalServerError(
				"Couldn't restore backup, see the logs for more information",
			);
	}

	@Get('/backups')
	async getBackups() {
		const backupPath = databaseConfig.path + '/backups';
		if (!backupPath)
			throw new InternalServerError(
				"Backup path not set, couldn't find backups",
			);

		const backupList = await this.db.getBackupList();

		if (backupList) return backupList;
		else
			throw new InternalServerError(
				"Couldn't get backup list, see the logs for more information",
			);
	}

	@Get('/size')
	size() {
		return this.db.getSize();
	}
}
