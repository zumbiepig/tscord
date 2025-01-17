import { type ArgsOf, Client, Discord } from 'discordx';

import { On } from '@/utils/decorators';
import { syncGuild } from '@/utils/functions';

@Discord()
export default class GuildDeleteEvent {
	@On('guildDelete')
	async guildDeleteHandler([oldGuild]: ArgsOf<'guildDelete'>, client: Client) {
		await syncGuild(oldGuild.id, client);
	}
}
