type Rest = Record<string, any>;

interface AdminDashboardProps {
	bots: SanitizededBotConfig[];
	authorizedBots: BotsState;
	currentBot: SanitizededBotConfig;
}
