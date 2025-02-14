import { Client, Discord, On } from 'discordx';
import { injectable } from 'tsyringe';

import { generalConfig } from '@/configs';
import { Data } from '@/entities';
import { Database, Logger, Scheduler, Store } from '@/services';
import { Schedule } from '@/utils/decorators';
import { syncAllGuilds } from '@/utils/functions';

@Discord()
@injectable()
export default class ReadyEvent {
	constructor(
		private db: Database,
		private logger: Logger,
		private scheduler: Scheduler,
		private store: Store,
		private client: Client,
	) {}

	private activityIndex = 0;

	@On({ event: 'ready' })
	async readyHandler([client]: [Client]) {
		// make sure all guilds are cached
		await client.guilds.fetch();

		// synchronize applications commands with Discord
		await client.initApplicationCommands();

		// change activity
		this.changeActivity();

		// update last startup time in the database
		await this.db.get(Data).set('lastStartup', Date.now());

		// start scheduled jobs
		this.scheduler.startAllJobs();

		// log startup
		await this.logger.logStartingConsole();

		// synchronize guilds between discord and the database
		await syncAllGuilds(client);

		// the bot is fully ready
		this.store.update('ready', (state) => ({ ...state, bot: true }));
	}

	@Schedule('*/15 * * * * *') // cycle activities every 15 seconds
	changeActivity() {
		if (generalConfig.activities.length > 0) {
			const activity = generalConfig.activities[this.activityIndex];

			if (activity) {
				this.client.user?.setPresence({
					status: activity.status,
					activities: [
						{
							name: activity.name,
							...(activity.type && { type: activity.type }),
							...(activity.url && { url: activity.url }),
						},
					],
				});
			}

			this.activityIndex =
				(this.activityIndex + 1) % generalConfig.activities.length;
		}
	}
}
