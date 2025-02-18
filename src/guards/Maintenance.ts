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
	ArgsOf<'interactionCreate' | 'messageCreate'>,
	InteractionData
> = async ([arg], _client, next, guardData) => {
	if (!(await isInMaintenance()) || isDev(resolveUser(arg).id)) await next();
	else await replyToInteraction(arg, guardData.localize.GUARDS.MAINTENANCE());
};
