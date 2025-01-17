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
