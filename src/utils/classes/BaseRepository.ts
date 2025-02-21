import { EntityRepository } from '@mikro-orm/core';

export abstract class BaseRepository<
	T extends object,
> extends EntityRepository<T> {}
