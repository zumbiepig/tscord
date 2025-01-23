import '@tsed/swagger';

import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import {
	Inject,
	PlatformAcceptMimesMiddleware,
	PlatformApplication,
} from '@tsed/common';
import { PlatformExpress } from '@tsed/platform-express';
import { json, urlencoded } from 'body-parser';

import * as controllers from '@/api/controllers';
import { Log } from '@/api/middlewares';
import env from '@/env';
import { Database, PluginsManager, Store } from '@/services';
import { Service } from '@/utils/decorators';

@Service()
export class Server {
	@Inject() app!: PlatformApplication;

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
			.use(json())
			.use(urlencoded({ extended: true }))
			.use(Log)
			.use(PlatformAcceptMimesMiddleware);

		return null;
	}

	@CreateRequestContext()
	async start() {
		const server = await PlatformExpress.bootstrap(Server, {
			rootDir: import.meta.dirname,
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
					specVersion: '3.1.0',
				},
			],
			logger: {
				level: 'warn',
				disableRoutesSummary: true,
			},
		});

		await server.listen().then(() => {
			this.store.update('ready', (state) => ({ ...state, api: true }));
		});
	}
}
