import { Context, Middleware, PlatformContext } from '@tsed/common';
import chalk from 'chalk';

import { Logger } from '@/services';
import { Injectable } from '@/utils/decorators';

@Middleware()
@Injectable()
export class Log {
	constructor(private logger: Logger) {}

	async use(@Context() { request }: PlatformContext) {
		const { method, url } = request;

		const message = `(API) ${method} - ${url}`;
		const chalkedMessage = `(${chalk.bold.white('API')}) ${chalk.bold.green(method)} - ${chalk.bold.blue(url)}`;

		await this.logger.log('info', message, chalkedMessage);
	}
}
