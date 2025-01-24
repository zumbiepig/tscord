import type { LogsConfigType } from '@/utils/types';

export const logsConfig: LogsConfigType = {
	logTailMaxSize: 50, // max size of the last logs kept in memory

	archive: {
		enabled: true, // is the auto-archiving enabled or not
		retentionDays: 30, // the number of days to keep the logs
	},

	// for each type of log, you can specify:
	// - if the log should be logged to the console
	// - if the log should be saved to the log files
	// - if the log should be sent to a discord channel (providing its channel ID)

	interaction: {
		file: true,
		console: true,
		channelId: null,

		// exclude some interactions types
		exclude: [
			'BUTTON_INTERACTION',
			'SELECT_MENU_INTERACTION',
			'STRING_SELECT_MENU_INTERACTION',
		],
	},

	simpleCommand: {
		file: true,
		console: true,
		channelId: null,
	},

	newUser: {
		file: true,
		console: true,
		channelId: null,
	},

	guild: {
		file: true,
		console: true,
		channelId: null,
	},

	error: {
		file: true,
		console: true,
		channelId: null,
	},
};
