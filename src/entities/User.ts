import {
	Entity,
	EntityRepository,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import type { Locale, Snowflake } from 'discord.js';

import { BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
	[EntityRepositoryType]!: UserRepository;

	@PrimaryKey()
	id!: Snowflake;

	@Property()
	lastInteract: Date = dayjsTimezone().toDate();

	@Property()
	locale!: Locale;
}

export class UserRepository extends EntityRepository<User> {
	async updateLastInteract(userId: Snowflake): Promise<void> {
		const user = await this.findOne(userId);

		if (user) {
			user.lastInteract = dayjsTimezone().toDate();
			await this.em.flush();
		}
	}
}
