import { CommandInteraction } from 'discord.js';
import { type GuardFunction, SimpleCommandMessage } from 'discordx';

import { L } from '@/i18n';
import {
	getLocaleFromInteraction,
	replyToInteraction,
} from '@/utils/functions';

/**
 * Prevent the command from running on DM
 */
export const GuildOnly: GuardFunction<
	CommandInteraction | SimpleCommandMessage
> = async (arg, _client, next) => {
	const isInGuild =
		arg instanceof CommandInteraction ? arg.inGuild() : arg.message.guild;

	if (isInGuild) {
		return next();
	} else {
		await replyToInteraction(
			arg,
			L[getLocaleFromInteraction(arg)].GUARDS.GUILD_ONLY(),
		);
		return;
	}
};
