import { Category } from '@discordx/utilities';
import {
	ChatInputCommandInteraction,
	CommandInteraction,
	type RepliableInteraction,
} from 'discord.js';
import { Client, Discord } from 'discordx';

import { L } from '@/i18n';
import { Slash } from '@/utils/decorators';
import type { InteractionData } from '@/utils/types';
import { replyToInteraction } from '@/utils/functions';

@Discord()
@Category('General')
export default class PingCommand {
	@Slash({
		name: 'ping',
	})
	async ping(
		interaction: CommandInteraction,
		client: Client,
		{ interactionLocale }: InteractionData,
	) {
		await replyToInteraction(interaction as RepliableInteraction, {
			content: 'Pinging...',
		});

		const content = L[interactionLocale].COMMANDS.PING.MESSAGE({
			time: msg.createdTimestamp - interaction.createdTimestamp,
			heartbeat: Math.floor(client.ws.ping).toString(),
		});

		await replyToInteraction(interaction as RepliableInteraction, content);
	}
}
