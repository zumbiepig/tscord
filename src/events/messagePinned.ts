import { Message } from 'discord.js';
import { Discord } from 'discordx';

import { Logger } from '@/services';
import { On } from '@/utils/decorators';
import { resolveDependencies } from '@/utils/functions';

@Discord()
export default class messagePinnedEvent {
	private logger!: Logger;

	constructor() {
		void resolveDependencies([Logger]).then(([logger]) => {
			this.logger = logger;
		})
	}

	@On('messagePinned')
	async messagePinnedHandler([message]: [Message]) {
		await this.logger.log('info', `This message from ${message.author.tag} has been pinned: ${message.content}`);
	}
}
