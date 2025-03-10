import { BodyParams, Controller, Get, Post, UseBefore } from '@tsed/common';
import { InternalServerError } from '@tsed/exceptions';
import { Required } from '@tsed/schema';
import { injectable } from 'tsyringe';

import { DevAuthenticated } from '@/api/middlewares';
import { databaseConfig, mikroORMConfig } from '@/configs';
import { Database } from '@/services';
import { BaseController } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Controller('/database')
@UseBefore(DevAuthenticated)
@injectable()
export class DatabaseController extends BaseController {
	constructor(private db: Database) {
		super();
	}

	@Post('/backup')
	async generateBackup() {
		const snapshotName = `snapshot_${dayjsTimezone().format('YYYY-MM-DD_HH-mm-ss')}_manual_${mikroORMConfig.dbName ?? ''}.backup`;
		const success = await this.db.backupDb(snapshotName);

		if (success) {
			return {
				message: 'Backup generated',
				data: {
					snapshotName: snapshotName,
				},
			};
		} else {
			throw new InternalServerError("Couldn't generate backup, see the logs for more information");
		}
	}

	@Post('/restore')
	async restoreBackup(@Required() @BodyParams('snapshotName') snapshotName: string) {
		const success = await this.db.restoreDb(snapshotName);

		if (success) return { message: 'Backup restored' };
		else throw new InternalServerError("Couldn't restore backup, see the logs for more information");
	}

	@Get('/backups')
	async getBackups() {
		if (!databaseConfig.path) throw new InternalServerError("Database path not set, couldn't find backups");

		const backupList = await this.db.getBackupList();

		if (backupList) return backupList;
		else throw new InternalServerError("Couldn't get backup list, see the logs for more information");
	}

	@Get('/size')
	size() {
		return this.db.getSize();
	}
}
