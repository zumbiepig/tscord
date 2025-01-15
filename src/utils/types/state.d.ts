interface State {
	authorizedAPITokens: string[];
	botHasBeenReloaded: boolean;
	ready: {
		bot: boolean | null;
		api: boolean | null;
	};
}
