import type { Interaction } from 'discord.js';
import {
	type ArgsOf,
	type GuardFunction,
	SimpleCommandMessage,
} from 'discordx';

import { resolveUser } from '@/utils/functions';

/**
 * Prevent other bots to interact with this bot
 */
export const NotBot: GuardFunction<
	| Interaction
	| SimpleCommandMessage
	| ArgsOf<'messageCreate' | 'messageReactionAdd' | 'voiceStateUpdate'>
> = async (arg, _client, next) => {
	const user = resolveUser(Array.isArray(arg) ? arg[0] : arg);
	if (!user?.bot) return next();
	return;
};
