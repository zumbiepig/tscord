import { Store as Rxeta } from 'rxeta';

import { apiConfig } from '@/configs';
import { Service } from '@/utils/decorators';
import type { State } from '@/utils/types';

const initialState: State = {
	ready: {
		bot: false,
		api: apiConfig.enabled ? false : null,
	},
	botHasBeenReloaded: false,
	authorizedAPITokens: [],
};

@Service(true)
export class Store extends Rxeta<State> {
	constructor() {
		super(initialState);
	}
}
