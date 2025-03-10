import process from 'node:process';

import { Logger } from '@/services';
import { resolveDependency } from '@/utils/functions';

export abstract class BaseError extends Error {
	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this.name = 'BaseError';
	}

	async handle(): Promise<void> {
		const logger = await resolveDependency(Logger);
		await logger.log('error', this.message);
	}

	kill(): never {
		return process.exit(1);
	}
}
