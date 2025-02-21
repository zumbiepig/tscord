import { type ArgsOf, Client, Discord, On } from 'discordx';

import { syncGuild } from '@/utils/functions';

@Discord()
export default class GuildCreateEvent {
	@On({ event: 'guildCreate' })
	async guildCreateHandler([newGuild]: ArgsOf<'guildCreate'>, client: Client) {
		await syncGuild(newGuild.id, client);
	}
}
