import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';

const a = {
	production: {
		driver: (await import('@mikro-orm/sqlite')).SqliteDriver,
	},
};

const b = { ...a.production };

console.log(b.driver === BetterSqliteDriver);
