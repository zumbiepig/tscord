import { Message } from 'discord.js';
import { Discord } from 'discordx';

import { On } from '@/utils/decorators';

@Discord()
export default class messagePinnedEvent {
	@On('messagePinned')
	async messagePinnedHandler([message]: [Message]) {
		await new Promise((resolve) => resolve); // placeholder await
		console.log(
			`This message from ${message.author.tag} has been pinned: ${message.content}`,
		);
	}
}
