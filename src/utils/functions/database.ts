import { createHash } from 'node:crypto';
import {
	createReadStream,
	createWriteStream,
	existsSync} from 'node:fs';
import { mkdir, readFile,writeFile } from 'node:fs/promises';

import { Data } from '@/entities';
import { Database } from '@/services';
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

const HEADER_LENGTH = 100;

/**
 * Backup any Sqlite3 Database incrementally. For simple use case, just call this function as `backup('<Your Database File>')`. Refer to documentation for more.
 * @param {string} sourceDb The input file name of the database which should be backed up. ***PLEASE USE AN UNIQUE FILENAME FOR EACH BACKUP***. Defaults to `snapshot-<current_timestamp>.txt`.
 * @param {string} snapshotName The name of the snapshot name. This file contains the references the objects (saves).
 * @param {string} objDir The directory where all the objects will be generated. The script must have right permission to that folder. For consistency, please use the same directory where the previous call of the API generated. Otherwise it would not be useful at all. It defaults to `objects/`.
 */
export async function backupDatabase(
	sourceDb: string,
	snapshotName = `snapshot-${Date.now()}.txt`,
	objDir: `${string}/` = 'objects/',
) {
	// get header of the file
	const readStream = createReadStream(sourceDb, {
		start: 0,
		end: HEADER_LENGTH,
	});

	readStream.on('data', (header) => {
		if (!(header instanceof Buffer)) return;

		// get the page size and count of the sqlite file at the 16th and 28th bytes
		const pageSize = header.readUInt16LE(16) * 256;
		// const pageCount = header.readUInt32LE(28)

		const dbFile = createReadStream(sourceDb, { highWaterMark: pageSize });

		const fileNames: string[] = [];

		dbFile.on(
			'data',
			(chunk) =>
				void (async (pageContent) => {
					// create a hash of the page content
					const hash = createHash('sha256').update(pageContent).digest('hex');

					// use the hash as the obj file name
					const fileDir = objDir + hash[0];
					const fileName = hash.substring(1);
					const fileDest = `${fileDir}/${fileName}`;

					// create the obj directory if it doesn't exist
					if (!existsSync(fileDir)) await mkdir(fileDir, { recursive: true });

					// write the sqlite page content to the obj file
					await writeFile(fileDest, pageContent);

					fileNames.push(fileDest);
				})(chunk),
		);

		dbFile.on('end', () => {
			console.log(
				'--->',
				sourceDb,
				'Backed up successfully to ---> ',
				snapshotName,
			);

			// write the `fileNames` into a snapshot file that contains the locations of the obj files which contain the current State of specified page of the sqlite database
			await writeFile(`${objDir}../${snapshotName}`, fileNames.join('\n'));
		});
	});
}

/**
 * Restore the database from a `snapshot` file. Please ***DO NOT*** alter the foder structure which was used to backup specifically, do not modify the folder where all the object file resides. The database will be restored and saved into the filename given by the parameter `targetDb`.
 * @param {string} targetDb The filename of the snapshot from which you want to restore the database. If resides in different database, please use the full path.
 * @param {string} snapshotFile The name of the file where the database will be restored. If there is an existing database having the same name, the previous database will be destroyed and the database from current snapshot will overwrite the content. 
 */
 export async function restoreDatabase(
    targetDb: string, 
    snapshotFile: string 
) {

    console.log('---> Restoration started from <--- ', snapshotFile)

    // get obj files from snapshot file
    const sources = await readFile(snapshotFile, { encoding: 'utf-8' }).split('\n')

    const writer = createWriteStream(targetDb, {autoClose: true})

    writer.on(
        'ready',
        () => {

            // write the obj files to the target database
            sources.forEach(
                (source) => {

                    if (!source) return
                    
                    const chunk = await readFile(source)
                    writer.write(chunk)
                    
                    console.log('\t--->', source, chunk.length)
                }
            )
            writer.end()
        }
    )

    writer.on(
        'close',
        () => {
            
            console.log('---> Restored successfully to ---> ', targetDb)
        }
    )
}
