import {
	Entity,
	EntityRepository,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';

import { BaseEntity } from '@/utils/classes';
import type { ValueOf } from 'type-fest';

const defaultData = {
	maintenance: false,
	lastMaintenance: Date.now(),
	lastStartup: Date.now(),
} as const;

@Entity({ repository: () => DataRepository })
export class Data extends BaseEntity {
	[EntityRepositoryType]?: DataRepository;

	@PrimaryKey()
	key!: keyof typeof defaultData;

	@Property()
	value!: (typeof defaultData)[keyof typeof defaultData];
}

export class DataRepository extends EntityRepository<Data> {
	async get<T extends keyof typeof defaultData>(
		key: T,
	): Promise<(typeof defaultData)[T]> {
		const data = await this.findOne({ key });

		if (data) return data.value as (typeof defaultData)[T];
		else return defaultData[key];
	}

	async set<T extends keyof typeof defaultData>(
		key: T,
		value: (typeof defaultData)[T],
	): Promise<void> {
		const data = await this.findOne({ key });

		if (data) data.value = value;
		else this.create({ key, value });

		await this.em.flush();
	}

	async add<T extends keyof typeof defaultData>(
		key: T,
		value: (typeof defaultData)[T],
	): Promise<void> {
		if (!(await this.findOne({ key }))) await this.set(key, value);
	}
}
