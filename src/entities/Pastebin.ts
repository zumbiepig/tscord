import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/better-sqlite';

import { dayjsTimezone } from '@/utils/functions';

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
	createdAt: Date = dayjsTimezone().toDate();
}

export class PastebinRepository extends EntityRepository<Pastebin> {}
