import { type ArgsOf, Client, Discord, On } from 'discordx';
import { injectable } from 'tsyringe';

import { generalConfig } from '@/configs';
import { Guild, User } from '@/entities';
import { Database, Logger, Stats } from '@/services';
import { syncUser } from '@/utils/functions';

@Discord()
@injectable()
export default class InteractionCreateEvent {
	constructor(
		private stats: Stats,
		private logger: Logger,
		private db: Database,
	) {}

	@On({ event: 'interactionCreate' })
	async interactionCreateHandler([interaction]: ArgsOf<'interactionCreate'>, client: Client) {
		// defer the reply
		if (generalConfig.automaticDeferring && !(interaction.isAutocomplete()))
			await interaction.deferReply();

		// insert user in db if not exists
		await syncUser(interaction.user);

		// update last interaction time of both user and guild
		await this.db.get(User).updateLastInteract(interaction.user.id);
		if (interaction.guild) await this.db.get(Guild).updateLastInteract(interaction.guild.id);

		// register logs and stats
		this.stats.registerInteraction(interaction);
		await this.logger.logInteraction(interaction);

		client.executeInteraction(interaction);
	}
}
