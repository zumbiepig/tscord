import { CommandInteraction, TextChannel } from 'discord.js';
import { type GuardFunction, SimpleCommandMessage } from 'discordx';

import { L } from '@/i18n';
import {
	getLocaleFromInteraction,
	replyToInteraction,
	resolveChannel,
} from '@/utils/functions';

/**
 * Prevent NSFW command from running in non-NSFW channels
 */
export const NSFW: GuardFunction<
	CommandInteraction | SimpleCommandMessage
> = async (arg, _client, next) => {
	const channel = resolveChannel(arg);
	if (!(channel instanceof TextChannel && !channel.nsfw)) {
		return next();
	} else {
		await replyToInteraction(
			arg,
			L[getLocaleFromInteraction(arg)].GUARDS.NSFW(),
		);
		return;
	}
};
