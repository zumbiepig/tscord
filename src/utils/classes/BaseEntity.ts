import {
	Entity,
	EntityRepositoryType,
	OptionalProps,
	Property,
	type RequiredEntityData,
} from '@mikro-orm/core';
import type { RequiredKeysOf } from 'type-fest';

import type { BaseRepository } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ abstract: true })
export abstract class BaseEntity<
	T extends Omit<BaseEntity<T>, typeof OptionalProps>,
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
	K extends RequiredKeysOf<
		RequiredEntityData<Omit<T, keyof BaseEntity<T>>>
	> = never,
> {
	abstract [EntityRepositoryType]?: BaseRepository<T>;

	[OptionalProps]?: 'createdAt' | 'updatedAt' | K;

	@Property()
	createdAt = dayjsTimezone().toDate();

	@Property({ onUpdate: () => dayjsTimezone().toDate() })
	updatedAt = dayjsTimezone().toDate();
}
