import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core';

import { BaseEntity, BaseRepository } from '@/utils/classes';
import type { StatAdditionalData, StatType } from '@/utils/types';

@Entity({ repository: () => StatRepository })
export class Stat extends BaseEntity<Stat> {
	[EntityRepositoryType]?: StatRepository;

	@PrimaryKey()
	id!: number;

	@Property()
	type!: StatType;

	@Property()
	value!: string;

	@Property()
	additionalData?: StatAdditionalData | undefined;
}

export class StatRepository extends BaseRepository<Stat> {}
