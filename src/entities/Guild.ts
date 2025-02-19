import {
	Entity,
	EntityRepository,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import type { Snowflake } from 'discord.js';

import { BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ repository: () => GuildRepository })
export class Guild extends BaseEntity<Guild> {
	[EntityRepositoryType]!: GuildRepository;

	@PrimaryKey()
	id!: Snowflake;

	@Property()
	lastInteract = dayjsTimezone().toDate();

	@Property()
	deleted = false;

	@Property()
	prefix?: string;
}

export class GuildRepository extends EntityRepository<Guild> {
	async updateLastInteract(guildId: Snowflake): Promise<void> {
		const guild = await this.findOne(guildId);

		if (guild) {
			guild.lastInteract = dayjsTimezone().toDate();
			await this.em.flush();
		}
	}

	async getActiveGuilds() {
		return this.find({ deleted: false });
	}
}
