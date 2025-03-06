import {
	ApplicationCommandOptionType,
	type RepliableInteraction,
} from 'discord.js';
import { Discord, Guard } from 'discordx';

import { DevsOnly } from '@/guards';
import { Slash, SlashOption } from '@/utils/decorators';
import { setMaintenance, simpleSuccessEmbed } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

@Discord()
export default class MaintenanceCommand {
	@Slash({
		name: 'maintenance',
	})
	@Guard(DevsOnly)
	async maintenance(
		@SlashOption({
			name: 'new_status',
			type: ApplicationCommandOptionType.Boolean,
			required: true,
		})
		new_status: boolean,
		interaction: RepliableInteraction,
		{ translations }: InteractionData,
	) {
		await setMaintenance(new_status);

		await simpleSuccessEmbed(
			interaction,
			translations.COMMANDS.MAINTENANCE.EMBED.DESCRIPTION({
				status: new_status ? 'enabled' : 'disabled',
			}),
		);
	}
}
