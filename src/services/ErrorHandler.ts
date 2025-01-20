import process from 'node:process';

import { Logger } from '@/services';
import { BaseError } from '@/utils/classes';
import { Service } from '@/utils/decorators';

@Service()
export class ErrorHandler {
	constructor(private logger: Logger) {
		// catch all uncaught exceptions
		process.on('uncaughtException', (error: Error, origin: string) => {
			if (origin === 'unhandledRejection') {
				return;
			} else if (error instanceof BaseError) {
				error.handle();
			} else {
				void this.logger.logError(error, 'uncaughtException');
			}
		});

		// catch all unhandled rejections (promise)
		process.on('unhandledRejection', (error: Error, _: Promise<never>) => {
			if (error instanceof BaseError) {
				error.handle();
			} else {
				void this.logger.logError(error, 'unhandledRejection');
			}
		});
	}
}
