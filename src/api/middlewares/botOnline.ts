import { Middleware } from '@tsed/common';
import { InternalServerError } from '@tsed/exceptions';
import { Client } from 'discordx';

import { resolveDependencies } from '@/utils/functions';

@Middleware()
export class BotOnline {
	private client!: Client;

	constructor() {
		void resolveDependencies([Client]).then(([client]) => {
			this.client = client;
		});
	}

	use() {
		if (this.client.user?.presence.status === 'offline')
			throw new InternalServerError('Bot is offline');
	}
}
