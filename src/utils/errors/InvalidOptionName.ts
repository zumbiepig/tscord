import { snake } from 'case';

import { Logger } from '@/services';
import { BaseError } from '@/utils/classes';
import { resolveDependencies } from '@/utils/functions';

export class InvalidOptionName extends BaseError {
	private logger!: Logger;

	constructor(nameOption: string) {
		super(
			`Name option must be all lowercase with no spaces. '${nameOption}' should be '${snake(nameOption)}'`,
		);

		void resolveDependencies([Logger]).then(([logger]) => {
			this.logger = logger;
		});
	}

	override handle() {
		this.logger.console(this.message, 'error');
		this.kill();
	}
}
