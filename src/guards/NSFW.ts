import { type ArgsOf, type GuardFunction } from 'discordx';

import { replyToInteraction, resolveChannel } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

/**
 * Prevent NSFW command from running in non-NSFW channels
 * @param invert Only allow the command to run in non-NSFW channels
 */
export function NSFW(
	invert = false,
): GuardFunction<
	ArgsOf<'interactionCreate' | 'messageCreate'>,
	InteractionData
> {
	return async ([arg], _client, next, guardData) => {
		const channel = resolveChannel(arg);
		if (channel && 'nsfw' in channel && channel.nsfw === !invert) await next();
		else await replyToInteraction(arg, guardData.translations.GUARDS.NSFW());
	};
}
