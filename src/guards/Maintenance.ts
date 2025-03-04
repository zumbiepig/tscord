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
> = async ([interaction], _client, next, guardData) => {
	if (!(await isInMaintenance()) || isDev(resolveUser(interaction).id)) await next();
	else await replyToInteraction(interaction, guardData.localize.GUARDS.MAINTENANCE());
};
