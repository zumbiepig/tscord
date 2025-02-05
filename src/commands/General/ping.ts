import { Category } from '@discordx/utilities';
import { CommandInteraction } from 'discord.js';
import { Client, Discord } from 'discordx';

import { Slash } from '@/utils/decorators';
import type { InteractionData } from '@/utils/types';

@Discord()
@Category('General')
export default class PingCommand {
	@Slash({
		name: 'ping',
	})
	async ping(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData,
	) {
		const msg = await interaction.followUp({
			content: 'Pinging...',
		});

		const content = localize.COMMANDS.PING.MESSAGE({
			time: msg.createdTimestamp - interaction.createdTimestamp,
			heartbeat: Math.floor(client.ws.ping).toString(),
		});

		await msg.edit(content);
	}
}
