import { Middleware } from '@tsed/common';
import { InternalServerError } from '@tsed/exceptions';
import { Client } from 'discordx';



@Middleware()
@injectable()
export class BotOnline {
	constructor(private client: Client) {}

	use() {
		if (this.client.user?.presence.status === 'offline')
			throw new InternalServerError('Bot is offline');
	}
}
