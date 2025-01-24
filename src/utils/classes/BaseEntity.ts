import { Property } from '@mikro-orm/core';

import { dayjsTimezone } from '../functions/date.js';

export abstract class BaseEntity {
	@Property()
	createdAt: Date = dayjsTimezone().toDate();

	@Property({ onUpdate: () => dayjsTimezone().toDate() })
	updatedAt: Date = dayjsTimezone().toDate();
}
