import {
	BaseEntity as MikroORMBaseEntity,
	Entity,
	OptionalProps,
	Property,
} from '@mikro-orm/core';

import { dayjsTimezone } from '@/utils/functions';

@Entity({ abstract: true })
export abstract class BaseEntity<
	Entity extends object = never,
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
	Optional extends keyof Entity = never,
> extends MikroORMBaseEntity {
	[OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

	@Property()
	createdAt = dayjsTimezone().toDate();

	@Property({ onUpdate: () => dayjsTimezone().toDate() })
	updatedAt = dayjsTimezone().toDate();
}
