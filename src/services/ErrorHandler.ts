import process from 'node:process';

import { Service } from '@/decorators';
import { Logger } from '@/services';
import { BaseError } from '@/utils/classes';

@Service()
export class ErrorHandler {
	constructor(private logger: Logger) {
		// Catch all exceptions
		process.on('uncaughtException', (error: Error, origin: string) => {
			// stop in case of unhandledRejection
			if (origin === 'unhandledRejection') return;

			// if instance of BaseError, call `handle` method
			if (error instanceof BaseError) {
				void error.handle();
				return;
			}

			// log the error
			void this.logger.logError(error, 'Exception');
		});

		// catch all Unhandled Rejection (promise)
		process.on('unhandledRejection', (error: Error, _: Promise<unknown>) => {
			// if instance of BaseError, call `handle` method
			if (error instanceof BaseError) {
				void error.handle();
				return;
			}

			// log the error
			void this.logger.logError(error, 'unhandledRejection');
		});
	}
}
