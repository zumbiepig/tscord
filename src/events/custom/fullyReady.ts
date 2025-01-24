import { Discord } from 'discordx';

import { Logger } from '@/services';
import { Injectable, OnCustom } from '@/utils/decorators';

@Discord()
@Injectable()
export default class FullyReadyEvent {
	constructor(private logger: Logger) {}

	@OnCustom('fullyReady')
	async fullyReadyHandler() {
		await this.logger.log('info', 'The template is fully ready!');
	}
}
