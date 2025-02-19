import {
	BaseEntity as MikroORMBaseEntity,
	Entity,
	OptionalProps,
	Property,
} from '@mikro-orm/core';

import { dayjsTimezone } from '@/utils/functions';

@Entity({ abstract: true })
export abstract class BaseEntity extends MikroORMBaseEntity {
	[OptionalProps]!: 'createdAt' | 'updatedAt';

	@Property()
	createdAt: Date = dayjsTimezone().toDate();

	@Property({ onUpdate: () => dayjsTimezone().toDate() })
	updatedAt: Date = dayjsTimezone().toDate();
}
