import { Store as RxStore } from 'rxeta';

import { apiConfig } from '@/configs';
import { Service } from '@/decorators';

const initialState: State = {
	authorizedAPITokens: [],
	botHasBeenReloaded: false,
	ready: {
		bot: false,
		api: apiConfig.enabled ? false : null,
	},
};

@Service(true)
export class Store extends RxStore<State> {
	constructor() {
		super(initialState);
	}
}
