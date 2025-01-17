import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/sqlite';

import { BaseEntity } from '@/utils/classes';
import type { DataType } from '@/utils/types';

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
	async get<T extends keyof DataType>(key: T): Promise<DataType[T]> {
		return JSON.parse(
			(await this.findOne({ key }))?.value ?? '',
		) as DataType[T];
	}

	async set<T extends keyof DataType>(
		key: T,
		value: DataType[T],
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

	async add<T extends keyof DataType>(
		key: T,
		value: DataType[T],
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
