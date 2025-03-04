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
	return async ([interaction], _client, next, guardData) => {
		const inGuild =
			interaction instanceof SimpleCommandMessage
				? interaction.message.inGuild()
				: interaction.inGuild();

		if (inGuild === !invert) await next();
		else
			await replyToInteraction(
				interaction,
				guardData.localize.GUARDS[invert ? 'DM_ONLY' : 'GUILD_ONLY'](),
			);
	};
}
