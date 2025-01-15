import { RequestContext } from '@mikro-orm/core';
import { type GuardFunction } from 'discordx';

import { Database } from '@/services';
import { resolveDependency } from '@/utils/functions';

/**
 * Isolate all the handling pipeline to prevent any MikrORM global identity map issues
 */
export const RequestContextIsolator: GuardFunction = async (
	_,
	_client,
	next,
) => {
	const db = await resolveDependency(Database);
	await RequestContext.create(db.orm.em, next);
};
