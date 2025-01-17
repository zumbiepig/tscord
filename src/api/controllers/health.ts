import { Controller, Get, UseBefore } from '@tsed/common';
import { Client } from 'discordx';

import { DevAuthenticated } from '@/api/middlewares';
import { Data } from '@/entities';
import { Database, Logger, Stats } from '@/services';
import { BaseController } from '@/utils/classes';
import { isInMaintenance, resolveDependencies } from '@/utils/functions';

@Controller('/health')
export class HealthController extends BaseController {
	private client!: Client;
	private db!: Database;
	private stats!: Stats;
	private logger!: Logger;

	constructor() {
		super();

		void resolveDependencies([Client, Database, Stats, Logger]).then(
			([client, db, stats, logger]) => {
				this.client = client;
				this.db = db;
				this.stats = stats;
				this.logger = logger;
			},
		);
	}

	@Get('/check')
	async healthcheck() {
		return {
			online: this.client.user?.presence.status !== 'offline',
			uptime: this.client.uptime,
			lastStartup: await this.db.get(Data).get('lastStartup'),
		};
	}

	@Get('/latency')
	latency() {
		return this.stats.getLatency();
	}

	@Get('/usage')
	async usage() {
		return await this.stats.getPidUsage();
	}

	@Get('/host')
	async host() {
		return await this.stats.getHostUsage();
	}

	@Get('/monitoring')
	@UseBefore(DevAuthenticated)
	async monitoring() {
		return {
			botStatus: {
				online: true,
				uptime: this.client.uptime,
				maintenance: await isInMaintenance(),
			},
			host: await this.stats.getHostUsage(),
			pid: await this.stats.getPidUsage(),
			latency: this.stats.getLatency(),
		};
	}

	@Get('/logs')
	@UseBefore(DevAuthenticated)
	logs() {
		return this.logger.getLastLogs();
	}
}
