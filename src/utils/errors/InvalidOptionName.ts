import { snakeCase } from 'change-case';

import { BaseError } from '@/utils/classes';

export class InvalidOptionNameError extends BaseError {
	constructor(nameOption: string) {
		super(
			`Name option must be all lowercase with no spaces. '${nameOption}' should be '${snakeCase(nameOption)}'`,
		);
	}

	override async handle() {
		await super.handle();
		this.kill();
	}
}
