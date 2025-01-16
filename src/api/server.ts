import '@tsed/swagger';

import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import {
	Inject,
	PlatformAcceptMimesMiddleware,
	PlatformApplication,
} from '@tsed/common';
import { PlatformExpress } from '@tsed/platform-express';
import bodyParser from 'body-parser';

import * as controllers from '@/api/controllers';
import { Log } from '@/api/middlewares';
import { Service } from '@/utils/decorators';
import { Database, PluginsManager, Store } from '@/services';

import env from '@/env';

@Service()
export class Server {
	@Inject() app: PlatformApplication;

	orm: MikroORM;

	constructor(
		private pluginsManager: PluginsManager,
		private store: Store,
		db: Database,
	) {
		this.orm = db.orm;
	}

	$beforeRoutesInit() {
		this.app
			.use(bodyParser.json())
			.use(bodyParser.urlencoded({ extended: true }))
			.use(Log)
			.use(PlatformAcceptMimesMiddleware);

		return null;
	}

	@CreateRequestContext()
	async start(): Promise<void> {
		const platform = await PlatformExpress.bootstrap(Server, {
			rootDir: import.meta.dir,
			httpPort: env.API_PORT,
			httpsPort: false,
			acceptMimes: ['application/json'],
			mount: {
				'/': [
					...Object.values(controllers),
					...this.pluginsManager.getControllers(),
				],
			},
			swagger: [
				{
					path: '/docs',
					specVersion: '3.0.1',
				},
			],
			logger: {
				level: 'warn',
				disableRoutesSummary: true,
			},
		});

		await platform.listen().then(() => {
			this.store.update('ready', (e) => ({ ...e, api: true }));
		});
	}
}
