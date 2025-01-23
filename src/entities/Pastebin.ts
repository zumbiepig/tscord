import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/sqlite';

@Entity({ repository: () => PastebinRepository })
export class Pastebin {
	[EntityRepositoryType]?: PastebinRepository;

	@PrimaryKey({ autoincrement: false })
	id!: string;

	@Property()
	editCode!: string;

	@Property()
	lifetime = -1;

	@Property()
	createdAt: Date = new Date();
}

export class PastebinRepository extends EntityRepository<Pastebin> {}
