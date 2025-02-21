import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import type { Locale, Snowflake } from 'discord.js';

import { BaseRepository, DiscordBaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ repository: () => UserRepository })
export class User extends DiscordBaseEntity {
	[EntityRepositoryType]!: UserRepository;

	@PrimaryKey()
	id!: Snowflake;

	@Property()
	locale?: Locale;
}

export class UserRepository extends BaseRepository<User> {
	async updateLastInteract(userId: Snowflake): Promise<void> {
		const user = await this.findOne(userId);

		if (user) {
			user.lastInteract = dayjsTimezone().toDate();
			await this.em.flush();
		}
	}
}
