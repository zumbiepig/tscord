import { BaseError } from '@/utils/classes';

export class NoBotTokenError extends BaseError {
	constructor() {
		super('Could not find BOT_TOKEN in your environment');
	}

	override handle() {
		this.logger.console(this.message, 'error');
		this.kill();
	}
}
