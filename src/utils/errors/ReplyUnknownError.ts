import { type RepliableInteraction } from 'discord.js';
import type { SimpleCommandMessage } from 'discordx';

import { L } from '@/i18n';
import { BaseError } from '@/utils/classes';
import { getLocaleFromInteraction, simpleErrorEmbed } from '@/utils/functions';

export class ReplyUnknownErrorError extends BaseError {
	constructor(
		private interaction: RepliableInteraction | SimpleCommandMessage,
	) {
		super();
	}

	override async handle() {
		const locale = getLocaleFromInteraction(this.interaction);
		await simpleErrorEmbed(this.interaction, L[locale].ERRORS.UNKNOWN());
	}
}
