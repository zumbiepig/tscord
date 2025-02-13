import { type ArgsOf, Client, Discord, Guard, On } from 'discordx';

import { Maintenance } from '@/guards';

@Discord()
export default class MessageCreateEvent {
	@On({ event: 'messageCreate'})
	@Guard(Maintenance)
	async messageCreateHandler(
		[message]: ArgsOf<'messageCreate'>,
		client: Client,
	) {
		await client.executeCommand(message, false);
	}
}
