import {
	type ArgsOf,
	Client,
	Discord,
	Guard,
	On,
	SimpleCommandMessage,
} from 'discordx';
import { injectable } from 'tsyringe';

import { generalConfig } from '@/configs';
import { Guild, User } from '@/entities';
import { Maintenance } from '@/guards';
import { Database, EventManager, Logger, Stats } from '@/services';
import { OnCustom } from '@/utils/decorators';
import { getPrefixFromMessage, syncUser } from '@/utils/functions';

@Discord()
@injectable()
export default class SimpleCommandCreateEvent {
	constructor(
		private stats: Stats,
		private logger: Logger,
		private db: Database,
		private eventManager: EventManager,
	) {}

	@OnCustom('simpleCommandCreate')
	async simpleCommandCreateHandler(command: SimpleCommandMessage) {
		// insert user in db if not exists
		await syncUser(command.message.author);

		// update last interaction time of both user and guild
		await this.db.get(User).updateLastInteract(command.message.author.id);
		await this.db.get(Guild).updateLastInteract(command.message.guild?.id);

		await this.stats.registerInteraction(command);
		await this.logger.logInteraction(command);
	}

	@On({ event: 'messageCreate' })
	@Guard(Maintenance)
	async simpleCommandCreateEmitter(
		[message]: ArgsOf<'messageCreate'>,
		client: Client,
	) {
		if (generalConfig.simpleCommandsPrefix) {
			const prefix = await getPrefixFromMessage(message);
			const command = await client.parseCommand(prefix ?? '', message, false);

			if (command && command instanceof SimpleCommandMessage) {
				await this.eventManager.emit('simpleCommandCreate', command);
			}
		}
	}
}
