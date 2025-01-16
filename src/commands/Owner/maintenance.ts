import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Guard } from 'discordx';

import { Disabled } from '@/guards';
import { Slash, SlashOption } from '@/utils/decorators';
import { setMaintenance, simpleSuccessEmbed } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

@Discord()
export default class MaintenanceCommand {
	@Slash({
		name: 'maintenance',
	})
	@Guard(Disabled)
	async maintenance(
		@SlashOption({
			name: 'state',
			type: ApplicationCommandOptionType.Boolean,
			required: true,
		})
		state: boolean,
		interaction: CommandInteraction,
		{ localize }: InteractionData,
	) {
		await setMaintenance(state);

		await simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.MAINTENANCE.EMBED.DESCRIPTION({
				state: state ? 'on' : 'off',
			}),
		);
	}
}
