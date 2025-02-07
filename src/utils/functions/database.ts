import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';

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
 * @param snapshotFile The name of the snapshot name. This file contains the references the objects (saves).
 */
export async function backupDatabase(
	sourceDb: string,
	backupDir: string,
	snapshotFile = `snapshot-${Date.now().toString()}.txt`,
) {
	const logger = await resolveDependency(Logger);

	const hashes: string[] = [];
	const queue = new Map<string, Promise<void>>();

	function saveChunk(chunk: Buffer | string) {
		// create a hash of the page content
		const hash = createHash('sha256').update(chunk).digest('hex');

		// use the hash as the object file name
		const fileDest = join(
			backupDir,
			'objects',
			hash.slice(0, 2),
			hash.slice(2),
		);

		// write the sqlite page content to the object file
		const promise = logger
			.log(
				'debug',
				`Copying chunk ${hash} from ${sourceDb}`,
				`Copying chunk ${chalk.bold.magenta(hash)} from ${chalk.bold.cyan(sourceDb)}`,
			)
			.then(() => writeFile(fileDest, chunk))
			.then(() => {
				hashes.push(hash);
				queue.delete(hash);
			});
		queue.set(hash, promise);

		return promise;
	}

	// log the database backup
	await logger.log(
		'info',
		`Backing up database ${sourceDb} from ${snapshotFile}`,
		`Backing up database ${chalk.bold.cyan(sourceDb)} from ${chalk.bold.green(snapshotFile)}`,
	);

	// create the objects directory if it doesn't exist
	await mkdir(join(dirname(backupDir), 'objects'), { recursive: true });

	// get header of the file
	const fileHandle = await open(sourceDb);
	const headerBuffer = (await fileHandle.read(Buffer.alloc(100), 0, 100, 0))
		.buffer;

	// backup the database header
	await saveChunk(headerBuffer);

	// get the page size of the sqlite file at the 16th byte
	let pageSize = headerBuffer.readUInt16BE(16);
	if (pageSize === 1) pageSize = 65536;

	// read the database file
	const reader = fileHandle.createReadStream({
		start: 100,
		highWaterMark: pageSize,
	});

	// backup each page as it is streamed
	reader.on('data', (chunk) => {
		if (queue.size >= 100) reader.pause();

		void saveChunk(chunk).then(() => {
			if (queue.size < 90) reader.resume();
		});
	});

	// wait until all data is read, then wait for everything to finish writing
	await once(reader, 'close');
	await Promise.all(queue.values());

	// write the `fileNames` into a snapshot file that contains the locations of the object files which contain the current State of specified page of the sqlite database
	await writeFile(join(backupDir, snapshotFile), hashes.join('\n'));

	// log the success
	await logger.log(
		'info',
		`Successfully backed up database ${sourceDb} from ${snapshotFile}`,
		`Successfully backed up database ${chalk.bold.cyan(sourceDb)} from ${chalk.bold.green(snapshotFile)}`,
	);
}

/**
 * Restore the database from a `snapshot` file. Please ***DO NOT*** alter the foder structure which was used to backup specifically, do not modify the folder where all the object file resides. The database will be restored and saved into the filename given by the parameter `targetDb`.
 * @param targetDb The filename of the snapshot from which you want to restore the database. If resides in different database, please use the full path.
 * @param snapshotFile The name of the file where the database will be restored. If there is an existing database having the same name, the previous database will be destroyed and the database from current snapshot will overwrite the content.
 */
export async function restoreDatabase(targetDb: string, snapshotFile: string) {
	const logger = await resolveDependency(Logger);

	// log the database restoration
	await logger.log(
		'info',
		`Restoring database ${targetDb} from ${snapshotFile}`,
		`Restoring database ${chalk.bold.cyan(targetDb)} from ${chalk.bold.green(snapshotFile)}`,
	);

	// get object files from snapshot file
	const hashes = (await readFile(snapshotFile, 'utf-8'))
		.split('\n')
		.map((hash) => join(hash.slice(0, 2), hash.slice(2)));

	// write to the batabase file
	const writer = createWriteStream(targetDb);

	// pipe each chunk to the write stream
	for (const hash of hashes) {
		await logger.log(
			'debug',
			`Writing chunk ${hash} to ${targetDb}`,
			`Writing chunk ${chalk.bold.magenta(hash)} to ${chalk.bold.cyan(targetDb)}`,
		);
		await pipeline(createReadStream(hash), writer, { end: false });
	}

	// end the write stream and wait for it to close
	writer.end();
	await once(writer, 'close');

	// log the success
	await logger.log(
		'info',
		`Successfully restored database ${targetDb} from ${snapshotFile}`,
		`Successfully restored database ${chalk.bold.cyan(targetDb)} from ${chalk.bold.green(snapshotFile)}`,
	);
}
