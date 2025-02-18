import {
	Entity,
	EntityRepository,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';

import { BaseEntity } from '@/utils/classes';
import type { StatType } from '@/utils/types';

@Entity({ repository: () => StatRepository })
export class Stat extends BaseEntity {
	[EntityRepositoryType]!: StatRepository;

	@PrimaryKey()
	id!: number;

	@Property()
	type!: StatType;

	@Property()
	value!: string;

	@Property({ type: 'json', nullable: true })
	additionalData?: unknown;
}

export class StatRepository extends EntityRepository<Stat> {}
