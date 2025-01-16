import process from 'node:process';

import { Logger } from '@/services';
import { BaseError } from '@/utils/classes';
import { Service } from '@/utils/decorators';

@Service()
export class ErrorHandler {
	constructor(private logger: Logger) {
		// Catch all exceptions
		process.on('uncaughtException', (error: Error, origin: string) => {
			if (origin === 'unhandledRejection') {
				// stop in case of unhandledRejection
				return;
			} else if (error instanceof BaseError) {
				// if instance of BaseError, call `handle` method
				error.handle();
				return;
			} else {
				// log the error
				void this.logger.logError(error, 'Exception');
			}
		});

		// catch all Unhandled Rejection (promise)
		process.on('unhandledRejection', (error: Error, _: Promise<never>) => {
			if (error instanceof BaseError) {
				// if instance of BaseError, call `handle` method
				error.handle();
				return;
			} else {
				// log the error
				void this.logger.logError(error, 'unhandledRejection');
			}
		});
	}
}
