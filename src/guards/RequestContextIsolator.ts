import { RequestContext } from '@mikro-orm/core';
import { type GuardFunction } from 'discordx';

import { Database } from '@/services';
import { resolveDependency } from '@/utils/functions';

/**
 * Isolate all the handling pipeline to prevent any MikroORM global identity map issues
 */
export const RequestContextIsolator: GuardFunction = async (_arg, _client, next) => {
	const db = await resolveDependency(Database);
	await RequestContext.create(db.em, next);
};
