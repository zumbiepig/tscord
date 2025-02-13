import { Context, Middleware, PlatformContext } from '@tsed/common';
import chalk from 'chalk';
import { injectable } from 'tsyringe';

import { Logger } from '@/services';

@Middleware()
@injectable()
export class Log {
	constructor(private logger: Logger) {}

	async use(@Context() { request }: PlatformContext) {
		const { method, url } = request;

		const message = `(API) ${method} - ${url}`;
		const chalkedMessage = `(${chalk.bold.white('API')}) ${chalk.bold.green(method)} - ${chalk.bold.blue(url)}`;

		await this.logger.log('info', message, chalkedMessage);
	}
}
