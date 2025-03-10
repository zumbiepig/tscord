import type { ArgsOf, GuardFunction } from 'discordx';

import { resolveUser } from '@/utils/functions';

/**
 * Prevent other bots to interact with this bot
 */
export const NotBot: GuardFunction<ArgsOf<'interactionCreate' | 'messageCreate'>> = async ([arg], _client, next) => {
	const user = resolveUser(arg);
	if (!user.bot) await next();
};
