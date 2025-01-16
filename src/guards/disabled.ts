import { CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import { type GuardFunction, SimpleCommandMessage } from 'discordx';

import { getLocaleFromInteraction, L } from '@/i18n';
import { isDev, replyToInteraction, resolveUser } from '@/utils/functions';

/**
 * Prevent interaction from running when it is disabled
 */
export const Disabled: GuardFunction<
	CommandInteraction | SimpleCommandMessage | ContextMenuCommandInteraction
> = async (arg, _client, next) => {
	const user = resolveUser(arg);
	if (user?.id && isDev(user.id)) {
		return next();
	} else {
		await replyToInteraction(
			arg,
			L[getLocaleFromInteraction(arg)].GUARDS.DISABLED_COMMAND(),
		);
		return;
	}
};
