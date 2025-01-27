import process from 'node:process';

import { Logger } from '@/services';
import { resolveDependency } from '@/utils/functions';

export class BaseError extends Error {
	async handle() {
		const logger = await resolveDependency(Logger);
		await logger.log('error', this.message);
	}

	kill() {
		process.exit(1);
	}
}
