import { extendTheme, ThemeConfig } from '@chakra-ui/react';

import colors from './colors';
import components from './components';
import fonts from './fonts';
import styles from './styles';

const config: ThemeConfig = {
	initialColorMode: 'dark',
	useSystemColorMode: false,
};

export const theme = extendTheme({
	config,
	colors,
	fonts,
	styles,
	components,
});
