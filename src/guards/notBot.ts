import { type ArgsOf, type GuardFunction } from 'discordx';

import { resolveUser } from '@/utils/functions';
import type { AllInteractions, EmittedInteractions } from '@/utils/types';

/**
 * Prevent other bots to interact with this bot
 */
export const NotBot: GuardFunction<
	| AllInteractions
	| ArgsOf<'messageCreate' | 'messageReactionAdd' | 'voiceStateUpdate'>
> = async (arg, _client, next) => {
	const user = resolveUser(
		(Array.isArray(arg) ? arg[0] : arg),
	);
	if (!user?.bot) return next();
	return;
};
