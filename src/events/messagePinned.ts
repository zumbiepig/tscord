import { Message } from 'discord.js';
import { Discord } from 'discordx';

import { Logger } from '@/services';
import { Injectable, On } from '@/utils/decorators';

@Discord()
@Injectable()
export default class messagePinnedEvent {
	constructor(private logger: Logger) {}

	@On('messagePinned')
	async messagePinnedHandler([message]: [Message]) {
		await this.logger.log(
			'info',
			`This message from ${message.author.tag} has been pinned: ${message.content}`,
		);
	}
}
