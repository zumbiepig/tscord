import type { Translation } from '../i18n-types.js';

export default {
	GUARDS: {
		DISABLED_COMMAND: 'This command is currently disabled.',
		DEVS_ONLY: 'This command can only be used by the bot developers.',
		MAINTENANCE: 'This bot is currently in maintenance mode.',
		GUILD_ONLY: 'This command can only be used in a server.',
		DM_ONLY: 'This command can only be used in DMs.',
		NSFW: 'This command can only be used in a NSFW channel.',
	},
	ERRORS: {
		UNKNOWN: 'An unknown error occurred.',
	},
	COMMANDS: {
		INVITE: {
			NAME: 'invite',
			DESCRIPTION: 'Invite the bot to your server!',
			EMBED: {
				TITLE: 'Invite me on your server!',
				DESCRIPTION: '[Click here]({link}) to invite me!',
			},
		},
		PREFIX: {
			NAME: 'prefix',
			DESCRIPTION: 'Change the prefix of the bot.',
			OPTIONS: {
				NEW_PREFIX: {
					NAME: 'new_prefix',
					DESCRIPTION: 'The new prefix of the bot.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Prefix changed to `{new_prefix}`.',
			},
		},
		MAINTENANCE: {
			NAME: 'maintenance',
			DESCRIPTION: 'Set the maintenance mode of the bot.',
			OPTIONS: {
				STATE: {
					NAME: 'new_status',
					DESCRIPTION: 'The new status of the maintenance',
				},
			},
			EMBED: {
				DESCRIPTION: 'Maintenance mode has been {status|{enabled:enabled,disabled:disabled}}.',
			},
		},
		STATS: {
			NAME: 'stats',
			DESCRIPTION: 'Get some stats about the bot.',
			OPTIONS: {
				DAYS: {
					NAME: 'days',
					DESCRIPTION: 'The number of days to get the stats from.',
				},
			},
			HEADERS: {
				USERS: 'Users',
				GUILDS: 'Guild',
				ACTIVE_USERS: 'Active Users',
				COMMANDS: 'Commands',
			},
		},
		HELP: {
			NAME: 'help',
			DESCRIPTION: 'Get global help about the bot and its commands',
			EMBED: {
				SELECT_CATEGORY_TITLE: 'Help panel',
				CATEGORY_TITLE: '{category} Commands',
			},
			SELECT_MENU: {
				SELECT_CATEGORY_DESCRIPTION: 'Select a category',
				CATEGORY_DESCRIPTION: '{category} commands',
			},
		},
		PING: {
			NAME: 'ping',
			DESCRIPTION: 'Get the ping of the bot.',
			MESSAGE: 'Pong! The message round-trip took {time}ms. The heartbeat ping is {heartbeat}ms.',
		},
	},
} satisfies Translation;
