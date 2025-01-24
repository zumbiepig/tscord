import { Property } from '@mikro-orm/core';

import { dayjsTimezone } from '@/utils/functions';

export abstract class BaseEntity {
	@Property()
	createdAt: Date = dayjsTimezone().toDate();

	@Property({ onUpdate: () => dayjsTimezone().toDate() })
	updatedAt: Date = dayjsTimezone().toDate();
}
