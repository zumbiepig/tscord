import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/sqlite';

import { BaseEntity } from '@/utils/classes';

/**
 * Default data for the Data table (dynamic EAV key/value pattern)
 */
export const defaultData = {
	maintenance: false,
	lastMaintenance: Date.now(),
	lastStartup: Date.now(),
};

type DataType = keyof typeof defaultData;

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ repository: () => DataRepository })
export class Data extends BaseEntity {
	[EntityRepositoryType]?: DataRepository;

	@PrimaryKey()
	key!: string;

	@Property()
	value = '';
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class DataRepository extends EntityRepository<Data> {
	async get<T extends DataType>(key: T) {
		return JSON.parse(
			(await this.findOne({ key }))?.value ?? '',
		) as (typeof defaultData)[T];
	}

	async set<T extends DataType>(
		key: T,
		value: (typeof defaultData)[T],
	): Promise<void> {
		const data = await this.findOne({ key });

		if (!data) {
			const newData = new Data();
			newData.key = key;
			newData.value = JSON.stringify(value);

			await this.em.persistAndFlush(newData);
		} else {
			data.value = JSON.stringify(value);
			await this.em.flush();
		}
	}

	async add<T extends DataType>(
		key: T,
		value: (typeof defaultData)[T],
	): Promise<void> {
		const data = await this.findOne({ key });

		if (!data) {
			const newData = new Data();
			newData.key = key;
			newData.value = JSON.stringify(value);

			await this.em.persistAndFlush(newData);
		}
	}
}
