import { type ArgsOf, type GuardFunction } from 'discordx';

import { isDev, replyToInteraction, resolveUser } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

/**
 * Only allow bot devs to run the command
 */
export const DevsOnly: GuardFunction<
	ArgsOf<'interactionCreate' | 'messageCreate'>
> = async ([arg], _client, next, { localize }: InteractionData) => {
	if (isDev(resolveUser(arg).id)) await next();
	else await replyToInteraction(arg, localize.GUARDS.DEVS_ONLY());
};
