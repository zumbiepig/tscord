import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';

import { BaseEntity, BaseRepository } from '@/utils/classes';

@Entity({ repository: () => ImageRepository })
export class Image extends BaseEntity<Image> {
	[EntityRepositoryType]?: ImageRepository;

	@PrimaryKey()
	id!: number;

	@Property()
	fileName!: string;

	@Property()
	basePath!: string;

	@Property()
	url!: string;

	@Property()
	size!: number;

	@Property()
	hash!: string;

	@Property()
	deleteHash?: string | undefined;

	@Property()
	tags!: string[];
}

export class ImageRepository extends BaseRepository<Image> {
	async findByTags(tags: string[], explicit = true): Promise<Image[]> {
		const rows = await this.find({
			$and: tags.map((tag) => ({ tags: new RegExp(tag) })),
		});

		return explicit
			? rows.filter((row) => row.tags.length === tags.length)
			: rows;
	}
}
