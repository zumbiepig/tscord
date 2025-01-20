import {
	Entity,
	EntityRepositoryType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/sqlite';

import { BaseEntity } from '@/utils/classes';

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ repository: () => GuildRepository })
export class Guild extends BaseEntity {
	[EntityRepositoryType]?: GuildRepository;

	@PrimaryKey({ autoincrement: false })
	id!: string;

	@Property({ nullable: true, type: 'string' })
	prefix!: string | null;

	@Property()
	deleted = false;

	@Property()
	lastInteract: Date = new Date();
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class GuildRepository extends EntityRepository<Guild> {
	async updateLastInteract(guildId?: string): Promise<void> {
		const guild = await this.findOne({ id: guildId ?? '' });

		if (guild) {
			guild.lastInteract = new Date();
			await this.em.flush();
		}
	}

	async getActiveGuilds() {
		return this.find({ deleted: false });
	}
}
