import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';

import chalk from 'chalk';

import { Data } from '@/entities';
import { Database, Logger } from '@/services';
import { resolveDependency } from '@/utils/functions';
import type { DataType } from '@/utils/types';

/**
 * Initiate the EAV Data table with the default data (dynamic EAV key/value pattern).
 */
export async function initDataTable() {
	const defaultData: DataType = {
		maintenance: false,
		lastMaintenance: Date.now(),
		lastStartup: Date.now(),
	};

	for (const key of Object.keys(defaultData)) {
		const db = await resolveDependency(Database);
		const dataRepository = db.get(Data);
		await dataRepository.add(
			key as keyof DataType,
			defaultData[key as keyof DataType],
		);
	}
}

/**
 * Backup any Sqlite3 Database incrementally. For simple use case, just call this function as `backup('<Your Database File>')`. Refer to documentation for more.
 * @param sourceDb The input file name of the database which should be backed up. ***PLEASE USE AN UNIQUE FILENAME FOR EACH BACKUP***. Defaults to `snapshot-<current_timestamp>.txt`.
 * @param snapshotName The name of the snapshot name. This file contains the references the objects (saves).
 */
export async function backupDatabase(
	sourceDb: string,
	backupDir: string,
	snapshotName = `snapshot-${Date.now().toString()}.txt`,
) {
	const logger = await resolveDependency(Logger);

	// create the objects directory if it doesn't exist
	await mkdir(join(dirname(backupDir), 'objects'), { recursive: true });

	await new Promise<void>((resolve) => {
		// get header of the file
		const headerStream = createReadStream(sourceDb, { start: 0, end: 99 });

		headerStream.on('data', (header) => {
			if (!(header instanceof Buffer)) return;

			const objectHashes: string[] = [];

			// get the page size of the sqlite file at the 16th byte
			const pageSize = header.readUInt16BE(16);

			const dbStream = createReadStream(sourceDb, { highWaterMark: pageSize });

			dbStream.on(
				'data',
				(pageContent) =>
					void (async () => {
						// create a hash of the page content
						const hash = createHash('sha256').update(pageContent).digest('hex');

						// use the hash as the object file name
						const fileDir = join('objects', hash.slice(0, 2));
						const fileName = hash.slice(2);

						const fileDest = join(fileDir, fileName);

						// write the sqlite page content to the object file
						await writeFile(fileDest, pageContent);

						objectHashes.push(hash);
					})(),
			);

			dbStream.on('end', () => {
				logger.log(
					'info',
					`---> ${sourceDb} Backed up successfully to ---> ${snapshotName}`,
				);

				// write the `fileNames` into a snapshot file that contains the locations of the object files which contain the current State of specified page of the sqlite database
				void writeFile(
					join('objects', '..', snapshotName),
					objectHashes.join('\n'),
				).then(resolve);
			});
		});
	});
}

/**
 * Restore the database from a `snapshot` file. Please ***DO NOT*** alter the foder structure which was used to backup specifically, do not modify the folder where all the object file resides. The database will be restored and saved into the filename given by the parameter `targetDb`.
 * @param targetDb The filename of the snapshot from which you want to restore the database. If resides in different database, please use the full path.
 * @param snapshotFile The name of the file where the database will be restored. If there is an existing database having the same name, the previous database will be destroyed and the database from current snapshot will overwrite the content.
 */
export async function restoreDatabase(targetDb: string, snapshotFile: string) {
	const logger = await resolveDependency(Logger);

	await logger.log(
		'info',
		`Restoring database ${targetDb} from ${snapshotFile}`,
		`Restoring database ${chalk.bold.cyan(targetDb)} from ${chalk.bold.green(snapshotFile)}`,
	);

	// get object files from snapshot file
	const sources: string[] = [];
	const lines = createInterface(createReadStream(snapshotFile, 'utf-8'));
	for await (const line of lines) sources.push(line);

	await new Promise<void>((resolve) => {
		const writer = createWriteStream(targetDb);

		writer.on(
			'ready',
			() =>
				void (async () => {
					// write the object files to the target database
					for (const source of sources) {
						await new Promise<void>((resolveSource) => {
							if (!source) return;

							const reader = createReadStream(source);
							reader.on('data', (chunk) => writer.write(chunk));
							reader.on(
								'close',
								() =>
									void logger
										.log('debug', `\t---> ${source} ${chunk.length.toString()}`)
										.then(resolveSource),
							);
						});
					}

					writer.end();
				}),
		);

		writer.on(
			'close',
			() =>
				void logger
					.log('info', '---> Restored successfully to ---> ' + targetDb)
					.then(resolve),
		);
	});
}
