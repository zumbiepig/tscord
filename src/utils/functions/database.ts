import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { createWriteStream } from 'node:fs';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import chalk from 'chalk';

import { Data } from '@/entities';
import { Database, Logger } from '@/services';
import { resolveDependency } from '@/utils/functions';
import type { DataRepositoryType } from '@/utils/types';

/**
 * Initiate the EAV Data table with the default data (dynamic EAV key/value pattern).
 */
export async function initDataTable() {
	const defaultData: DataRepositoryType = {
		maintenance: false,
		lastMaintenance: Date.now(),
		lastStartup: Date.now(),
	};

	for (const key of Object.keys(defaultData)) {
		const db = await resolveDependency(Database);
		const dataRepository = db.get(Data);
		await dataRepository.add(
			key as keyof DataRepositoryType,
			defaultData[key as keyof DataRepositoryType],
		);
	}
}

/**
 * Backup any Sqlite3 Database incrementally.
 * @param dbFile The input file name of the database which should be backed up.
 * @param snapshotFile The file where the snapshot will be saved.
 * @param objectsDir The directory where the backup objects will be stored.
 */
export async function backupDatabase(
	dbFile: string,
	snapshotFile: string,
	objectsDir: string,
) {
	const MAX_CONCURRENT_WRITES = 100;

	const logger = await resolveDependency(Logger);

	const hashes: string[] = [];
	const queue = new Map<string, Promise<void>>();

	function saveChunk(chunk: Buffer | string) {
		// create a hash of the page content
		const hash = createHash('sha256').update(chunk).digest('hex');

		// use the hash as the object file name
		const fileDest = join(objectsDir, hash.slice(0, 2), hash.slice(2));

		// write the sqlite page content to the object file
		const promise = logger
			.log(
				'debug',
				`Copying chunk ${hash} from ${dbFile}`,
				`Copying chunk ${chalk.bold.magenta(hash)} from ${chalk.bold.cyan(dbFile)}`,
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
		`Backing up database ${dbFile} to ${snapshotFile}`,
		`Backing up database ${chalk.bold.cyan(dbFile)} to ${chalk.bold.green(snapshotFile)}`,
	);

	// create the objects directory if it doesn't exist
	await mkdir(objectsDir, { recursive: true });

	// get header of the file
	const fileHandle = await open(dbFile);
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
		if (queue.size >= MAX_CONCURRENT_WRITES) reader.pause();

		void saveChunk(chunk).then(() => {
			if (queue.size < MAX_CONCURRENT_WRITES * 0.8) reader.resume();
		});
	});

	// wait until all data is read, then wait for everything to finish writing
	await once(reader, 'end');
	await Promise.all(queue.values());

	// write the `fileNames` into a snapshot file that contains the locations of the object files which contain the current State of specified page of the sqlite database
	await writeFile(snapshotFile, hashes.join('\n'));

	// log the success
	await logger.log(
		'info',
		`Successfully backed up database ${dbFile} to ${snapshotFile}`,
		`Successfully backed up database ${chalk.bold.cyan(dbFile)} to ${chalk.bold.green(snapshotFile)}`,
	);
}

/**
 * Restore the database from a snapshot file.
 * @param dbFile The name of the file where the database will be restored. If there is an existing database having the same name, the previous database will be destroyed and the database from current snapshot will overwrite the content.
 * @param snapshotFile The filename of the snapshot from which you want to restore the database.
 * @param objectsDir The directory where the backup objects are stored.
 */
export async function restoreDatabase(
	dbFile: string,
	snapshotFile: string,
	objectsDir: string,
) {
	const logger = await resolveDependency(Logger);

	// log the database restoration
	await logger.log(
		'info',
		`Restoring database ${dbFile} from ${snapshotFile}`,
		`Restoring database ${chalk.bold.cyan(dbFile)} from ${chalk.bold.green(snapshotFile)}`,
	);

	// get object files from snapshot file
	const hashes = (await readFile(snapshotFile, 'utf8'))
		.split('\n')
		.map((hash) => hash.trim());

	// write to the batabase file
	const writer = createWriteStream(dbFile);

	// pipe each chunk to the write stream
	for (const hash of hashes) {
		if (!hash) continue;

		await logger.log(
			'debug',
			`Writing chunk ${hash} to ${dbFile}`,
			`Writing chunk ${chalk.bold.magenta(hash)} to ${chalk.bold.cyan(dbFile)}`,
		);

		if (
			!writer.write(
				await readFile(join(objectsDir, hash.slice(0, 2), hash.slice(2))),
			)
		)
			await once(writer, 'drain');
	}

	// end the write stream and wait for it to close
	writer.end();
	await once(writer, 'finish');

	// log the success
	await logger.log(
		'info',
		`Successfully restored database ${dbFile} from ${snapshotFile}`,
		`Successfully restored database ${chalk.bold.cyan(dbFile)} from ${chalk.bold.green(snapshotFile)}`,
	);
}
