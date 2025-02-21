import { Category, PermissionGuard } from '@discordx/utilities';
import {
	ApplicationCommandOptionType,
	type RepliableInteraction,
} from 'discord.js';
import { Discord, Guard, SimpleCommandMessage } from 'discordx';
import { injectable } from 'tsyringe';

import { generalConfig } from '@/configs';
import { Guild } from '@/entities';
import { Database } from '@/services';
import { Slash, SlashOption } from '@/utils/decorators';
import { ReplyUnknownErrorError } from '@/utils/errors';
import { resolveGuild, simpleSuccessEmbed } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';

@Discord()
@injectable()
@Category('Admin')
export default class PrefixCommand {
	constructor(private db: Database) {}

	@Slash({ name: 'prefix' })
	@Guard(PermissionGuard(['Administrator']))
	async prefix(
		@SlashOption({
			name: 'prefix',
			type: ApplicationCommandOptionType.String,
		})
		prefix: string | undefined,
		interaction: RepliableInteraction | SimpleCommandMessage,
		{ localize }: InteractionData,
	) {
		const guild = resolveGuild(interaction);
		if (!guild) throw new ReplyUnknownErrorError(interaction);

		const guildData = await this.db.get(Guild).findOneOrFail(guild.id);
		guildData.prefix = prefix;
		await this.db.em.flush();

		await simpleSuccessEmbed(
			interaction,
			localize.COMMANDS.PREFIX.EMBED.DESCRIPTION({
				prefix: prefix ?? generalConfig.simpleCommandsPrefix ?? '',
			}),
		);
	}
}
