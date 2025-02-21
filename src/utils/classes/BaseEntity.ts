import {
	BaseEntity as MikroORMBaseEntity,
	Entity,
	OptionalProps,
	Property,
} from '@mikro-orm/core';
import type { ConditionalExcept, ConditionalPick, Except } from 'type-fest';

import { dayjsTimezone } from '@/utils/functions';

@Entity({ abstract: true })
export abstract class BaseEntity<
	Entity extends (
		Entity extends Except<BaseEntity, Extract<keyof BaseEntity, symbol>>
			? true
			: false
	) extends true
		? object
		: never = never,
	Optional extends Exclude<keyof Entity, keyof BaseEntity> = never,
> extends MikroORMBaseEntity {
	declare _: Optional;

	[OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

	@Property()
	createdAt = dayjsTimezone().toDate();

	@Property({ onUpdate: () => dayjsTimezone().toDate() })
	updatedAt = dayjsTimezone().toDate();
}

class Test {
	test = 'test';
}

export class Person extends BaseEntity<Person, 'name'> {
	@Property()
	name = 'John Doe';
}
