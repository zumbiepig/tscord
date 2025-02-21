import { Discord } from 'discordx';
import { injectable } from 'tsyringe';

import { Logger } from '@/services';
import { OnCustom } from '@/utils/decorators';

@Discord()
@injectable()
export default class FullyReadyEvent {
	constructor(private logger: Logger) {}

	@OnCustom('fullyReady')
	async fullyReadyHandler() {
		await this.logger.log('info', 'The template is fully ready!');
	}
}
