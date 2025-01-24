import { Middleware } from '@tsed/common';
import { InternalServerError } from '@tsed/exceptions';
import { Client } from 'discordx';

import { Injectable } from '@/utils/decorators';

@Middleware()
@Injectable()
export class BotOnline {
	constructor(private client: Client) {}

	use() {
		if (this.client.user?.presence.status === 'offline')
			throw new InternalServerError('Bot is offline');
	}
}
