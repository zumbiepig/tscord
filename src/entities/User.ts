import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/sqlite';

import { BaseEntity } from '@/utils/classes';

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
	[EntityRepositoryType]?: UserRepository;

	@PrimaryKey({ autoincrement: false })
	id!: string;

	@Property()
	lastInteract: Date = new Date();
}

export class UserRepository extends EntityRepository<User> {
	async updateLastInteract(userId?: string): Promise<void> {
		const user = await this.findOne({ id: userId ?? '' });

		if (user) {
			user.lastInteract = new Date();
			await this.em.flush();
		}
	}
}
