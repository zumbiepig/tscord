import { type Snowflake, User as DUser } from 'discord.js';
import { Client } from 'discordx';

import { Guild, User } from '@/entities';
import { Database, Logger, Stats } from '@/services';
import { resolveDependencies, resolveDependency } from '@/utils/functions';

/**
 * Add a active user to the database if doesn't exist.
 * @param user
 */
export async function syncUser(user: DUser) {
	const [db, stats, logger] = await resolveDependencies([
		Database,
		Stats,
		Logger,
	]);

	const userRepo = db.get(User);

	const userData = await userRepo.findOne({
		id: user.id,
	});

	if (!userData) {
		// add user to the db
		const newUser = new User();
		newUser.id = user.id;
		await db.em.persistAndFlush(newUser);

		// record new user both in logs and stats
		stats.register('NEW_USER', user.id);
		await logger.logNewUser(user);
	}
}

/**
 * Sync a guild with the database.
 * @param guildId
 * @param client
 */
export async function syncGuild(guildId: Snowflake, client: Client) {
	const [db, stats, logger] = await resolveDependencies([
		Database,
		Stats,
		Logger,
	]);

	const guildData = await db.get(Guild).findOne(guildId);

	const fetchedGuild = await client.guilds.fetch(guildId).catch(() => null);

	// check if this guild exists in the database, if not it creates it (or recovers it from the deleted ones)
	if (!guildData) {
		// create new guild
		db.em.create(Guild, { id: guildId });

		stats.register('NEW_GUILD', guildId);
		await logger.logGuild('NEW_GUILD', guildId);
	} else if (!guildData.active && fetchedGuild) {
		// recover deleted guild
		guildData.active = true;

		stats.register('RECOVER_GUILD', guildId);
		await logger.logGuild('RECOVER_GUILD', guildId);
	} else if (!fetchedGuild) {
		// guild is deleted but still exists in the database
		guildData.active = false;

		stats.register('DELETE_GUILD', guildId);
		await logger.logGuild('DELETE_GUILD', guildId);
	}
}

/**
 * Sync all guilds with the database.
 * @param client
 */
export async function syncAllGuilds(client: Client) {
	const guildIds: Snowflake[] = [];

	// add missing guilds
	const clientGuilds = client.guilds.cache;
	clientGuilds.forEach((guild) => guildIds.push(guild.id));

	// remove deleted guilds
	const db = await resolveDependency(Database);
	const guildsData = await db.get(Guild).getActive();
	guildsData.forEach((guildData) => guildIds.push(guildData.id));

	// sync guilds
	for (const guildId of guildIds) await syncGuild(guildId, client);
}
