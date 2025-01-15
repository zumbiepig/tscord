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
	const db = await resolveDependency(Database);
	const guildRepo = db.get(Guild);

	const guildData = await guildRepo.findOne({ id: message.guild?.id ?? '' });

	return guildData?.prefix ?? generalConfig.simpleCommandsPrefix;
}
