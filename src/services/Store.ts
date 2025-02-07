import Rxeta from 'rxeta';

import { apiConfig } from '@/configs';
import { Service } from '@/utils/decorators';

const initialState = {
	ready: {
		bot: false,
		api: apiConfig.enabled ? false : null,
	},
	botHasBeenReloaded: false,
	authorizedAPITokens: [],
};

@Service(true)
export class Store extends Rxeta<typeof initialState> {
	constructor() {
		super();

		void Promise.all(
			Object.entries(initialState).map(([key, value]) => this.set(key, value)),
		);
	}
}
