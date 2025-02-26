import { Entity, EntityRepositoryType, Property } from '@mikro-orm/core';

import { BaseDiscordEntity, BaseDiscordRepository } from '@/utils/classes';

@Entity({ repository: () => GuildRepository })
export class Guild extends BaseDiscordEntity<Guild> {
	[EntityRepositoryType]?: GuildRepository;

	@Property()
	prefix?: string | undefined;
}

export class GuildRepository extends BaseDiscordRepository<Guild> {}
