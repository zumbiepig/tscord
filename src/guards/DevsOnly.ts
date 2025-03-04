import { type ArgsOf, type GuardFunction } from 'discordx';

import { isDev, replyToInteraction, resolveUser } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

/**
 * Only allow bot devs to run the command
 */
export const DevsOnly: GuardFunction<
	ArgsOf<'interactionCreate' | 'messageCreate'>,
	InteractionData
> = async ([arg], _client, next, guardData) => {
	if (isDev(resolveUser(arg).id)) await next();
	else await replyToInteraction(arg, guardData.translations.GUARDS.DEVS_ONLY());
};
