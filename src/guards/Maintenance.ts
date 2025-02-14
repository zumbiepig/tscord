import { type ArgsOf, type GuardFunction } from 'discordx';

import {
	isDev,
	isInMaintenance,
	replyToInteraction,
	resolveUser,
} from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

/**
 * Prevent interactions from running when bot is in maintenance
 */
export const Maintenance: GuardFunction<
	ArgsOf<'interactionCreate' | 'messageCreate'>
> = async ([arg], _client, next, { localize }: InteractionData) => {
	if (!(await isInMaintenance()) || isDev(resolveUser(arg).id)) await next();
	else await replyToInteraction(arg, localize.GUARDS.MAINTENANCE());
};
