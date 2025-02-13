import { type ArgsOf, Client, On } from 'discordx';

import { Discord } from '@/utils/decorators';
import { syncGuild } from '@/utils/functions';

@Discord
export default class GuildCreateEvent {
	@On({ event: 'guildCreate' })
	async guildCreateHandler([newGuild]: ArgsOf<'guildCreate'>, client: Client) {
		await syncGuild(newGuild.id, client);
	}
}
