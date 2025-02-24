import {
	EntityRepository,
	EntityRepositoryType,
	OptionalProps,
} from '@mikro-orm/core';

import type { BaseEntity } from '@/utils/classes';

export abstract class BaseRepository<
	T extends Omit<BaseEntity<T>, typeof OptionalProps>,
> extends EntityRepository<Omit<T, typeof EntityRepositoryType>> {}
