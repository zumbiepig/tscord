import {
	Entity,
	PrimaryKey,
	PrimaryKeyProp,
	Property,
	type RequiredEntityData,
} from '@mikro-orm/core';
import type { Snowflake } from 'discord.js';
import type { RequiredKeysOf } from 'type-fest';

import { BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ abstract: true })
export abstract class DiscordBaseEntity<
	Entity extends object = never,
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
	Optional extends RequiredKeysOf<
		RequiredEntityData<Omit<Entity, keyof DiscordBaseEntity>>
	> = never,
> extends BaseEntity<DiscordBaseEntity, 'active' | 'lastInteract' | Optional> {
	[PrimaryKeyProp]?: 'snowflake';

	@PrimaryKey()
	snowflake!: Snowflake;

	@Property()
	active = true;

	@Property()
	lastInteract = dayjsTimezone().toDate();
}
