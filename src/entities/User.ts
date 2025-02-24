import { Entity, EntityRepositoryType, Property } from '@mikro-orm/core';
import type { Locale } from 'discord.js';

import { BaseDiscordEntity, BaseDiscordRepository } from '@/utils/classes';

@Entity({ repository: () => UserRepository })
export class User extends BaseDiscordEntity<User> {
	[EntityRepositoryType]?: UserRepository;

	@Property()
	locale?: Locale;
}

export class UserRepository extends BaseDiscordRepository<User> {}
