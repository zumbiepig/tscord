import {
	Entity,
	EntityRepository,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';

import { BaseEntity } from '@/utils/classes';
import type { DataRepositoryType } from '@/utils/types';

@Entity({ repository: () => DataRepository })
export class Data extends BaseEntity {
	[EntityRepositoryType]?: DataRepository;

	@PrimaryKey()
	key!: string;

	@Property()
	value = '';
}

export class DataRepository extends EntityRepository<Data> {
	async get<T extends keyof DataRepositoryType>(
		key: T,
	): Promise<DataRepositoryType[T]> {
		return JSON.parse(
			(await this.findOne({ key }))?.value ?? '',
		) as DataRepositoryType[T];
	}

	async set<T extends keyof DataRepositoryType>(
		key: T,
		value: DataRepositoryType[T],
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

	async add<T extends keyof DataRepositoryType>(
		key: T,
		value: DataRepositoryType[T],
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
