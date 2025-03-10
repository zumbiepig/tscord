import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core';

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
	deleteHash!: string | undefined;

	@Property()
	tags!: string[];
}

export class ImageRepository extends BaseRepository<Image> {
	/**
	 * Abstraction level for the image repository that will find an image by its name (with or without extension).
	 * @param imageName
	 * @returns image url
	 */
	async getImage(imageName: string) {
		return await this.findOne({
			fileName: {
				$or: [imageName, `${imageName}.png`, `${imageName}.jpeg`, `${imageName}.jpg`, `${imageName}.gif`],
			},
		});
	}

	/**
	 * Find images by their tags
	 * @param tags tags to search for
	 * @returns An array of images found
	 */
	async findByTags(tags: string[]) {
		return await this.find({ tags: { $and: tags } });
	}
}
