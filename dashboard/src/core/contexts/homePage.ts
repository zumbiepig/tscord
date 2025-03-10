import { createContext } from 'react';

interface HomePageContextType {
	botData: BotData;
}

export const HomePageContext = createContext<HomePageContextType>({} as HomePageContextType);
