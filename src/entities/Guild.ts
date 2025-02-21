import {
	Entity,
	EntityRepositoryType,
	Property,
} from '@mikro-orm/core';
import type { Snowflake } from 'discord.js';

import { BaseRepository, DiscordBaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ repository: () => GuildRepository })
export class Guild extends DiscordBaseEntity {
	[EntityRepositoryType]?: GuildRepository;

	@Property()
	prefix?: string | undefined;
}

export class GuildRepository extends BaseRepository<Guild> {
	async updateLastInteract(guildId: Snowflake): Promise<void> {
		const guild = await this.findOne(guildId);

		if (guild) {
			guild.lastInteract = dayjsTimezone().toDate();
			await this.em.flush();
		}
	}

	async getActiveGuilds() {
		return this.find({ active: true });
	}
}
