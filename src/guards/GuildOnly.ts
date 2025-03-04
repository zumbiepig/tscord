import {
	type ArgsOf,
	type GuardFunction,
	SimpleCommandMessage,
} from 'discordx';

import { replyToInteraction } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

/**
 * Prevent the command from running in DMs
 * @param invert Only allow the command to run in DMs
 */
export function GuildOnly(
	invert = false,
): GuardFunction<
	ArgsOf<'interactionCreate' | 'messageCreate'>,
	InteractionData
> {
	return async ([arg], _client, next, guardData) => {
		const inGuild =
			arg instanceof SimpleCommandMessage
				? arg.message.inGuild()
				: arg.inGuild();

		if (inGuild === !invert) await next();
		else
			await replyToInteraction(
				arg,
				guardData.translations.GUARDS[invert ? 'DM_ONLY' : 'GUILD_ONLY'](),
			);
	};
}
