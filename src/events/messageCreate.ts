import { type ArgsOf, Client, Discord, Guard } from 'discordx';

import { Maintenance } from '@/guards';
import { On } from '@/utils/decorators';

@Discord()
export default class MessageCreateEvent {
	@On('messageCreate')
	@Guard(Maintenance)
	async messageCreateHandler(
		[message]: ArgsOf<'messageCreate'>,
		client: Client,
	) {
		await client.executeCommand(message, false);
	}
}
