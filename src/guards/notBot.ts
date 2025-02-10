import type { Interaction } from 'discord.js';
import {
	SimpleCommandMessage,
	type ArgsOf,
	type GuardFunction,
} from 'discordx';

import { resolveMember, resolveUser } from '@/utils/functions';

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
