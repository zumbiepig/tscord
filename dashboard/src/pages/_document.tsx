import { ColorModeScript } from '@chakra-ui/react';
import { theme } from '@core/theme';
import Document, { Head, Html, Main, NextScript } from 'next/document';

class MainDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					{/* <title>TSCord</title> */}
					{/* <link rel="apple-touch-icon" sizes="180x180" href="assets/favicon/apple-touch-icon.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon/favicon-32x32.png" />
					<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon/favicon-16x16.png" />
					<link rel="manifest" href="assets/favicon/site.webmanifest" />
					<link rel="mask-icon" href="assets/favicon/safari-pinned-tab.svg" color="#5bbad5" />
					<meta name="msapplication-TileColor" content="#da532c" />
					<meta name="theme-color" content="#ffffff" /> */}
				</Head>
				<body>
					<ColorModeScript initialColorMode={theme.config.initialColorMode} />
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MainDocument;
