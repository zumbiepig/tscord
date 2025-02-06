import Keyv from 'keyv';

import { apiConfig } from '@/configs';
import { Service } from '@/utils/decorators';
import type { State } from '@/utils/types';

const initialState: State = {
	authorizedAPITokens: [],
	botHasBeenReloaded: false,
	ready: {
		bot: false,
		api: apiConfig.enabled ? false : null,
	},
};

@Service(true)
export const store = new RxStore(initialState);

export class Store extends Keyv<string[] | boolean | null> {
	constructor() {
		super(initialState);

		void Promise.all(Object.entries(initialState).map(([key, value]) => 
			this.set(key, value)
		));
	}
}
