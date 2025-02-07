export interface State {
	ready: {
		bot: boolean | null;
		api: boolean | null;
	};
	botHasBeenReloaded: boolean;
	authorizedAPITokens: string[];
}
