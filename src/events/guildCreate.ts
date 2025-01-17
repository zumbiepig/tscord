import { type ArgsOf, Client, Discord } from 'discordx';

import { On } from '@/utils/decorators';
import { syncGuild } from '@/utils/functions';

@Discord()
export default class GuildCreateEvent {
	@On('guildCreate')
	async guildCreateHandler([newGuild]: ArgsOf<'guildCreate'>, client: Client) {
		await syncGuild(newGuild.id, client);
	}
}
