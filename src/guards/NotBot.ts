import type { ArgsOf, GuardFunction } from 'discordx';

import { resolveUser } from '@/utils/functions';

/**
 * Prevent other bots to interact with this bot
 */
export const NotBot: GuardFunction<
	ArgsOf<'interactionCreate' | 'messageCreate'>
> = async ([interaction], _client, next) => {
	const user = resolveUser(interaction);
	if (!user.bot) await next();
};
