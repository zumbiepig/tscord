import process from 'node:process';

import { inject } from 'tsyringe';

import { Logger } from '@/services';
import { Injectable } from '@/utils/decorators';

@Injectable()
// should be abstract but tsyringe doesn't support abstract classes
export class BaseError extends Error {
	constructor(
		message?: string,
		@inject(Logger) protected logger?: Logger,
	) {
		super(message);
	}

	async handle() {
		await this.logger?.log('error', this.message);
	}

	kill() {
		process.exit(1);
	}
}
