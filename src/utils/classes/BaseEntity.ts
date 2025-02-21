import {
	BaseEntity as MikroORMBaseEntity,
	Entity,
	OptionalProps,
	Property,
} from '@mikro-orm/core';
import type { Except } from 'type-fest';

import { dayjsTimezone } from '@/utils/functions';

@Entity({ abstract: true })
export abstract class BaseEntity<
	Entity extends (
		Entity extends Except<BaseEntity, typeof OptionalProps> ? true : false
	) extends true
		? object
		: BaseEntity = never,
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
	Optional extends Exclude<keyof Entity, keyof BaseEntity> = never,
> extends MikroORMBaseEntity {
	[OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

	@Property()
	createdAt = dayjsTimezone().toDate();

	@Property({ onUpdate: () => dayjsTimezone().toDate() })
	updatedAt = dayjsTimezone().toDate();
}

export class Person extends BaseEntity<Person, 'name'> {
	@Property()
	name = 'John Doe';
}
