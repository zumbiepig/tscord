import {
	Entity,
	EntityRepositoryType,
	OptionalProps,
	PrimaryKey,
	Property,
	type RequiredEntityData,
} from '@mikro-orm/core';
import type { Snowflake } from 'discord.js';
import type { RequiredKeysOf } from 'type-fest';

import { BaseDiscordRepository, BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ abstract: true })
export abstract class BaseDiscordEntity<
	T extends Omit<BaseDiscordEntity<T>, typeof OptionalProps>,
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
	K extends RequiredKeysOf<
		RequiredEntityData<Omit<T, keyof BaseDiscordEntity<T>>>
	> = never,
> extends BaseEntity<BaseDiscordEntity<T>, 'active' | 'lastInteract' | K> {
	abstract override [EntityRepositoryType]?: BaseDiscordRepository<T>;

	@PrimaryKey({ autoincrement: false })
	id!: Snowflake;

	@Property()
	active = true;

	@Property()
	lastInteract = dayjsTimezone().toDate();
}
