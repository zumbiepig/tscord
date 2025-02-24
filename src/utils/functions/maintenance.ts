import { Data } from '@/entities';
import { Database } from '@/services';
import { resolveDependency } from '@/utils/functions';

/**
 * Get the maintenance state of the bot.
 */
export async function isInMaintenance(): Promise<boolean> {
	const db = await resolveDependency(Database);
	return await db.get(Data).get('maintenance');
}

/**
 * Set the maintenance state of the bot.
 */
export async function setMaintenance(maintenance: boolean): Promise<void> {
	const db = await resolveDependency(Database);
	await db.get(Data).set('maintenance', maintenance);
}
