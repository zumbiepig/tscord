import { Discord, On } from 'discordx';

import { Logger } from '@/services';
import { injectable } from 'tsyringe';
import type { Message } from 'discord.js';

@Discord()
@injectable()
export default class messagePinnedEvent {
	constructor(private logger: Logger) {}

	@On({ event: 'messagePinned' })
	async messagePinnedHandler([message]: [Message]) {
		await this.logger.log(
			'info',
			`This message from ${message.author.tag} has been pinned: ${message.content}`,
		);
	}
}
