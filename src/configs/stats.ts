import type { StatsConfigType } from '../utils/types/configs';

export const statsConfig: StatsConfigType = {
	interaction: {
		// exclude interaction types from being recorded as stat
		exclude: ['BUTTON_INTERACTION', 'SELECT_MENU_INTERACTION'],
	},
};
