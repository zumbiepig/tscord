import { Context, Middleware, PlatformContext } from '@tsed/common';
import chalk from 'chalk';

import { Logger } from '@/services';
import { resolveDependencies } from '@/utils/functions';

@Middleware()
export class Log {
	private logger!: Logger;

	constructor() {
		void resolveDependencies([Logger]).then(([logger]) => {
			this.logger = logger;
		});
	}

	async use(@Context() { request }: PlatformContext) {
		const { method, url } = request;

		const message = `(API) ${method} - ${url}`;
		const chalkedMessage = `(${chalk.bold.white('API')}) ${chalk.bold.green(method)} - ${chalk.bold.blue(url)}`;

		this.logger.console(chalkedMessage);
		await this.logger.file(message);
	}
}
