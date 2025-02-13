import { Category, PermissionGuard } from '@discordx/utilities';
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Guard } from 'discordx';

import { generalConfig } from '@/configs';
import { Guild } from '@/entities';
import { L } from '@/i18n';
import { Database } from '@/services';
import { Slash, SlashOption } from '@/utils/decorators';
import { ReplyUnknownErrorError } from '@/utils/errors';
import { resolveGuild, simpleSuccessEmbed } from '@/utils/functions';
import type { InteractionData } from '@/utils/types';
import { injectable } from 'tsyringe';

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
		interaction: CommandInteraction,
		{ interactionLocale }: InteractionData,
	) {
		const guild = resolveGuild(interaction);
		const guildData = await this.db.get(Guild).findOne({ id: guild?.id ?? '' });

		if (guildData) {
			guildData.prefix = prefix ?? null;
			await this.db.em.persistAndFlush(guildData);

			await simpleSuccessEmbed(
				interaction,
				L[interactionLocale].COMMANDS.PREFIX.EMBED.DESCRIPTION({
					prefix: prefix ?? generalConfig.simpleCommandsPrefix,
				}),
			);
		} else {
			throw new ReplyUnknownErrorError(interaction);
		}
	}
}
