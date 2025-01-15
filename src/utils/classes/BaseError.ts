import process from 'node:process';

import { Logger } from '@/services';
import { resolveDependency } from '@/utils/functions';

export abstract class BaseError extends Error {
	protected logger!: Logger;

	constructor(message?: string) {
		super(message);
		void resolveDependency(Logger).then((logger) => {
			this.logger = logger;
		});
	}

	abstract handle(): Promise<void>;

	kill() {
		process.exit(1);
	}
}
