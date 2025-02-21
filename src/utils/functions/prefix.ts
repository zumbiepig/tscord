import { Message } from 'discord.js';

import { generalConfig } from '@/configs';
import { Guild } from '@/entities';
import { Database } from '@/services';
import { resolveDependency } from '@/utils/functions';

/**
 * Get prefix from the database or from the config file.
 * @param message
 */
export async function getPrefixFromMessage(message: Message) {
	if (!message.guild) return generalConfig.simpleCommandsPrefix;

	const db = await resolveDependency(Database);
	const guildData = await db.get(Guild).findOneOrFail(message.guild.id);

	return guildData.prefix ?? generalConfig.simpleCommandsPrefix;
}
