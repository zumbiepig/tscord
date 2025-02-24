import type { Snowflake } from 'discord.js';

import { BaseDiscordEntity, BaseRepository } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

export abstract class BaseDiscordRepository<
	T extends BaseDiscordEntity<T>,
> extends BaseRepository<BaseDiscordEntity<T>> {
	async getAllActive() {
		return this.find({ active: true });
	}

	async updateLastInteract(id: Snowflake): Promise<void> {
		const entity = await this.findOneOrFail(id);
		entity.lastInteract = dayjsTimezone().toDate();
	}
}
