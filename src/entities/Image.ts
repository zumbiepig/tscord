import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/better-sqlite';

import { BaseEntity } from '@/utils/classes';

@Entity({ repository: () => ImageRepository })
export class Image extends BaseEntity {
	[EntityRepositoryType]?: ImageRepository;

	@PrimaryKey()
	id!: number;

	@Property()
	fileName!: string;

	@Property({ default: '' })
	basePath?: string;

	@Property()
	url!: string;

	@Property()
	size!: number;

	@Property()
	hash!: string;

	@Property()
	deleteHash!: string;
}

export class ImageRepository extends EntityRepository<Image> {}
