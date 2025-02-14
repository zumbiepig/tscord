import {
	Entity,
	EntityRepository,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';

import { BaseEntity } from '@/utils/classes';
import { dayjsTimezone } from '@/utils/functions';

@Entity({ repository: () => GuildRepository })
export class Guild extends BaseEntity {
	[EntityRepositoryType]?: GuildRepository;

	@PrimaryKey({ autoincrement: false })
	id!: string;

	@Property()
	lastInteract: Date = dayjsTimezone().toDate();

	@Property()
	deleted = false;

	@Property({ nullable: true, type: 'string' })
	prefix!: string | null;
}

export class GuildRepository extends EntityRepository<Guild> {
	async updateLastInteract(guildId: string): Promise<void> {
		const guild = await this.findOne({ id: guildId });

		if (guild) {
			guild.lastInteract = dayjsTimezone().toDate();
			await this.em.flush();
		}
	}

	async getActiveGuilds() {
		return this.find({ deleted: false });
	}
}
