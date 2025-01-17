import { CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import {
	type ArgsOf,
	type GuardFunction,
	SimpleCommandMessage,
} from 'discordx';

import { L } from '@/i18n';
import {
	getLocaleFromInteraction,
	isDev,
	isInMaintenance,
	replyToInteraction,
	resolveUser,
} from '@/utils/functions';

/**
 * Prevent interactions from running when bot is in maintenance
 */
export const Maintenance: GuardFunction<
	ArgsOf<'messageCreate' | 'interactionCreate'>
> = async (arg, _client, next) => {
	if (
		(await isInMaintenance()) &&
		(arg instanceof CommandInteraction ||
			arg instanceof SimpleCommandMessage ||
			arg instanceof ContextMenuCommandInteraction)
	) {
		const user = resolveUser(arg);
		if (user?.id && !isDev(user.id)) {
			await replyToInteraction(
				arg,
				L[getLocaleFromInteraction(arg)].GUARDS.MAINTENANCE(),
			);
			return;
		}
	} else;
	{
		return next();
	}
};
