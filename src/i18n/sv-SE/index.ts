import type { Translation } from '../i18n-types.js';
export default {
	GUARDS: {
		DISABLED_COMMAND: 'This command is currently disabled.',
		MAINTENANCE: 'This bot is currently in maintenance mode.',
		GUILD_ONLY: 'This command can only be used in a server.',
		NSFW: 'This command can only be used in a NSFW channel.',
	},
	ERRORS: {
		UNKNOWN: 'An unknown error occurred.',
	},
	SHARED: {
		NO_COMMAND_DESCRIPTION: 'No description provided.',
	},
	COMMANDS: {
		INVITE: {
			DESCRIPTION: 'Invite the bot to your server!',
			EMBED: {
				TITLE: 'Invite me on your server!',
				DESCRIPTION: '[Click here]({link:string}) to invite me!',
			},
		},
		PREFIX: {
			NAME: 'prefix',
			DESCRIPTION: 'Change the prefix of the bot.',
			OPTIONS: {
				PREFIX: {
					NAME: 'new_prefix',
					DESCRIPTION: 'The new prefix of the bot.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Prefix changed to `{prefix:string}`.',
			},
		},
		MAINTENANCE: {
			DESCRIPTION: 'Set the maintenance mode of the bot.',
			EMBED: {
				DESCRIPTION:
					'Maintenance mode has been {status | {enabled: enabled, disabled: disabled}}.',
			},
		},
		STATS: {
			DESCRIPTION: 'Get some stats about the bot.',
			HEADERS: {
				COMMANDS: 'Commands',
				GUILDS: 'Guild',
				ACTIVE_USERS: 'Active Users',
				USERS: 'Users',
			},
		},
		HELP: {
			DESCRIPTION: 'Get global help about the bot and its commands',
			EMBED: {
				TITLE: 'Help panel',
				CATEGORY_TITLE: '{category} Commands',
			},
			SELECT_MENU: {
				TITLE: 'Select a category',
				CATEGORY_DESCRIPTION: '{category} commands',
			},
		},
		PING: {
			DESCRIPTION: 'Get the ping of the bot.',
			MESSAGE:
				'Pong! The message round-trip took {time}ms. The heartbeat ping is {heartbeat}ms.',
		},
	},
} satisfies Translation;
