import {
	BaseEntity as MikroORMBaseEntity,
	Entity,
	PrimaryKey,
	PrimaryKeyProp,
	Property,
} from '@mikro-orm/core';
import type { Snowflake } from 'discord.js';

import { BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ abstract: true })
export abstract class DiscordBaseEntity<
	Entity = never,
	Optional = never,
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
