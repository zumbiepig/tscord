import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/better-sqlite';

import { BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
	[EntityRepositoryType]?: UserRepository;

	@PrimaryKey({ autoincrement: false })
	id!: string;

	@Property()
	lastInteract: Date = dayjsTimezone().toDate();
}

export class UserRepository extends EntityRepository<User> {
	async updateLastInteract(userId?: string): Promise<void> {
		const user = await this.findOne({ id: userId ?? '' });

		if (user) {
			user.lastInteract = dayjsTimezone().toDate();
			await this.em.flush();
		}
	}
}
