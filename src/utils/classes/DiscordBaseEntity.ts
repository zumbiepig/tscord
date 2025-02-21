import {
	Entity,
	OptionalProps,
	PrimaryKey,
	PrimaryKeyProp,
	Property,
} from '@mikro-orm/core';
import type { Snowflake } from 'discord.js';

import { BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';
import type { Except } from 'type-fest';

@Entity({ abstract: true })
export abstract class DiscordBaseEntity<
	Entity extends (
		Entity extends Except<DiscordBaseEntity, typeof OptionalProps> ? true : false
	) extends true
		? object
		: DiscordBaseEntity = never,
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
	Optional extends Exclude<keyof Entity, keyof DiscordBaseEntity> = never,
> extends BaseEntity<Entity, 'active' | 'lasInteract' | Optional> {
	[PrimaryKeyProp]?: 'snowflake';

	@PrimaryKey()
	snowflake!: Snowflake;

	@Property()
	active = true;

	@Property()
	lastInteract = dayjsTimezone().toDate();
}

export class DiscordPerson extends DiscordBaseEntity<DiscordPerson, 'name'> {
	@Property()
	name = 'John Doe';
}
