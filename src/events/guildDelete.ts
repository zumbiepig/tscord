import { type ArgsOf, Client, Discord, On } from 'discordx';

import { syncGuild } from '@/utils/functions';

@Discord()
export default class GuildDeleteEvent {
	@On({ event: 'guildDelete' })
	async guildDeleteHandler([oldGuild]: ArgsOf<'guildDelete'>, client: Client) {
		await syncGuild(oldGuild.id, client);
	}
}
