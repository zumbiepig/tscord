import { Message } from 'discord.js';
import { Discord } from 'discordx';

import { On } from '@/utils/decorators';

@Discord()
export default class messagePinnedEvent {
	@On('messagePinned')
	// eslint-disable-next-line @typescript-eslint/require-await
	async messagePinnedHandler([message]: [Message]) {
		console.log(
			`This message from ${message.author.tag} has been pinned: ${message.content}`,
		);
	}
}
