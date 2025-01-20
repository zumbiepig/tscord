import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/sqlite';

import { BaseEntity } from '@/utils/classes';

// ===========================================
// ================= Entity ==================
// ===========================================

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
	tags!: string[];

	@Property()
	hash!: string;

	@Property()
	deleteHash!: string;
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class ImageRepository extends EntityRepository<Image> {
	async findByTags(tags: string[], explicit = true): Promise<Image[]> {
		const rows = await this.find({
			$and: tags.map((tag) => ({ tags: new RegExp(tag) })),
		});

		return explicit
			? rows.filter((row) => row.tags.length === tags.length)
			: rows;
	}
}
