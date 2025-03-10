type BotState = 'authorized' | 'unauthorized' | 'offline';

interface BotsState {
	authorized: SanitizededBotConfig[];
	unauthorized: SanitizededBotConfig[];
	offline: SanitizededBotConfig[];
}
