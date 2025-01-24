import { CommandInteraction } from 'discord.js';

import { L } from '@/i18n';
import { BaseError } from '@/utils/classes';
import { getLocaleFromInteraction, simpleErrorEmbed } from '@/utils/functions';

export class UnknownReplyError extends BaseError {
	private interaction: CommandInteraction;

	constructor(interaction: CommandInteraction, message?: string) {
		super(message);

		this.interaction = interaction;
	}

	override async handle() {
		const locale = getLocaleFromInteraction(this.interaction);
		await simpleErrorEmbed(this.interaction, L[locale].ERRORS.UNKNOWN());
	}
}
