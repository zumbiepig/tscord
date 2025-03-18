import { Category, PermissionGuard } from '@discordx/utilities';
import { ApplicationCommandOptionType, PermissionFlagsBits, type RepliableInteraction } from 'discord.js';
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

	@Slash({ nameLocalizations: 'COMMANDS.PREFIX.NAME', descriptionLocalizations: 'COMMANDS.PREFIX.DESCRIPTION', defaultMemberPermissions: PermissionFlagsBits.Administrator })
	@Guard(PermissionGuard(['Administrator']))
	async prefix(
		@SlashOption({
			type: ApplicationCommandOptionType.String,
			nameLocalizations: 'COMMANDS.PREFIX.OPTIONS.NEW_PREFIX.NAME',
			descriptionLocalizations: 'COMMANDS.PREFIX.OPTIONS.NEW_PREFIX.DESCRIPTION',
		})
		new_prefix: string | undefined,
		interaction: RepliableInteraction | SimpleCommandMessage,
		{ translations }: InteractionData,
	) {
		const guild = resolveGuild(interaction);
		if (!guild) throw new ReplyUnknownErrorError(interaction);

		const guildData = await this.db.get(Guild).findOneOrFail(guild.id);
		guildData.prefix = new_prefix;

		await simpleSuccessEmbed(
			interaction,
			translations.COMMANDS.PREFIX.EMBED.DESCRIPTION({
				new_prefix: new_prefix ?? generalConfig.simpleCommandsPrefix ?? undefined,
			}),
		);
	}
}
