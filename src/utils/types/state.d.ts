export interface State {
	ready: {
		bot: boolean;
		api: boolean | undefined;
	};
	botHasBeenReloaded: boolean;
	authorizedAPITokens: string[];
}
