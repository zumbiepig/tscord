import type { Snowflake } from 'discord.js';

import { BaseDiscordEntity, BaseRepository } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

export abstract class BaseDiscordRepository<T extends BaseDiscordEntity<T>> extends BaseRepository<T> {
	async getActive() {
		return (this as BaseRepository<BaseDiscordEntity<T>>).find({
			active: true,
		});
	}

	async updateLastInteract(id: Snowflake): Promise<void> {
		const entity = await (this as BaseRepository<BaseDiscordEntity<T>>).findOneOrFail(id);
		entity.lastInteract = dayjsTimezone().toDate();
	}
}
