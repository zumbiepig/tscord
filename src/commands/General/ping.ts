import { Category } from '@discordx/utilities';
import { type RepliableInteraction } from 'discord.js';
import { Client, Discord } from 'discordx';

import { Slash } from '@/utils/decorators';
import { replyToInteraction } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

@Discord()
@Category('General')
export default class PingCommand {
	@Slash({
		name: 'ping',
	})
	async ping(
		interaction: RepliableInteraction,
		client: Client,
		{ localize }: InteractionData,
	) {
		const reply = await replyToInteraction(interaction, 'Pinging...');

		await reply.edit(
			localize.COMMANDS.PING.MESSAGE({
				time: reply.createdTimestamp - interaction.createdTimestamp,
				heartbeat: Math.floor(client.ws.ping).toString(),
			}),
		);
	}
}
