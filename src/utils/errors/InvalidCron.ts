import { BaseError } from '@/utils/classes';

export class InvalidCronError extends BaseError {
	constructor(cronExpression: string) {
		super(`Invalid cron expression: ${cronExpression}`);
	}

	override async handle() {
		await super.handle();
		this.kill();
	}
}
