import { Discord } from 'discordx';

import { Logger } from '@/services';
import { OnCustom } from '@/utils/decorators';
import { injectable } from 'tsyringe';

@Discord()
@injectable
export default class FullyReadyEvent {
	constructor(private logger: Logger) {}

	@OnCustom('fullyReady')
	async fullyReadyHandler() {
		await this.logger.log('info', 'The template is fully ready!');
	}
}
