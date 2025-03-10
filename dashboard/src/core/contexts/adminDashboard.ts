import { createContext } from 'react';

interface AdminDashboardContextType {
	currentBot: SanitizededBotConfig;
	authorizedBots: BotsState;
}

export const AdminDashboardContext = createContext<AdminDashboardContextType>({} as AdminDashboardContextType);
