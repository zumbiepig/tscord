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
			fetchReply: true,
		});

		const content = localize.COMMANDS.PING.MESSAGE({
			member: msg.inGuild() ? `${JSON.stringify(interaction.member)},` : '',
			time: msg.createdTimestamp - interaction.createdTimestamp,
			heartbeat: client.ws.ping
				? ` The heartbeat ping is ${Math.round(client.ws.ping).toString()}ms.`
				: '',
		});

		await msg.edit(content);
	}
}
