import {
	Entity,
	EntityRepository,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';

import { dayjsTimezone } from '@/utils/functions';

@Entity({ repository: () => StatRepository })
export class Stat {
	[EntityRepositoryType]?: StatRepository;

	@PrimaryKey()
	id!: number;

	@Property()
	type!: string;

	@Property()
	value = '';

	@Property({ type: 'json', nullable: true })
	additionalData?: unknown;

	@Property()
	createdAt: Date = dayjsTimezone().toDate();
}

export class StatRepository extends EntityRepository<Stat> {}
