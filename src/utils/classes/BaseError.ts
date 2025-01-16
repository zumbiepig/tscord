import process from 'node:process';

import { Logger } from '@/services';
import { resolveDependencies } from '@/utils/functions';

export abstract class BaseError extends Error {
	protected logger!: Logger;

	constructor(message?: string) {
		super(message);

		void resolveDependencies([Logger]).then(([logger]) => {
			this.logger = logger;
		});
	}

	abstract handle(): void;

	kill() {
		process.exit(1);
	}
}
