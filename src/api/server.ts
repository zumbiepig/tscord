import '@tsed/swagger';

import { CreateRequestContext } from '@mikro-orm/core';
import { Inject, PlatformAcceptMimesMiddleware, PlatformApplication } from '@tsed/common';
import { PlatformExpress } from '@tsed/platform-express';

import * as controllers from '@/api/controllers';
import { Log } from '@/api/middlewares';
import { apiConfig } from '@/configs';
import { PluginsManager, Store } from '@/services';
import { Service } from '@/utils/decorators';

@Service()
export class Server {
	@Inject() app!: PlatformApplication;

	constructor(
		private pluginsManager: PluginsManager,
		private store: Store,
	) {}

	@CreateRequestContext()
	async start() {
		const server = await PlatformExpress.bootstrap(Server, {
			rootDir: import.meta.dirname,
			httpPort: apiConfig.port,
			httpsPort: false,
			acceptMimes: ['application/json'],
			middlewares: ['json-parser', Log, PlatformAcceptMimesMiddleware],
			mount: {
				'/': [...Object.values(controllers), ...this.pluginsManager.getControllers()],
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
			this.store.update('ready', (ready) => ({ ...ready, api: true }));
		});
	}
}
