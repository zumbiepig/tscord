import {
	Entity,
	EntityRepository,
	EntityRepositoryType,
	PrimaryKey,
	PrimaryKeyProp,
	Property,
} from '@mikro-orm/core';

import { BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

interface DataRepositoryType {
	maintenance: boolean;
	lastMaintenance: Date;
	lastStartup: Date;
}

const defaultData: DataRepositoryType = {
	maintenance: false,
	lastMaintenance: dayjsTimezone().toDate(),
	lastStartup: dayjsTimezone().toDate(),
};

@Entity({ repository: () => DataRepository })
export class Data extends BaseEntity {
	[EntityRepositoryType]?: DataRepository;
	[PrimaryKeyProp]?: 'key';

	@PrimaryKey()
	key!: keyof DataRepositoryType;

	@Property()
	value!: DataRepositoryType[typeof this.key];
}

export class DataRepository extends EntityRepository<Data> {
	async get<T extends keyof DataRepositoryType>(
		key: T,
	): Promise<DataRepositoryType[T]> {
		const data = await this.findOne(key);

		if (data) return data.value as DataRepositoryType[T];
		else return defaultData[key];
	}

	async set<T extends keyof DataRepositoryType>(
		key: T,
		value: DataRepositoryType[T],
	): Promise<void> {
		const data = await this.findOne(key);

		if (data) data.value = value;
		else this.create({ key, value });

		await this.em.flush();
	}
}
