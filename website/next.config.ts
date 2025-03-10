import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
	reactStrictMode: true,

	sassOptions: {
		includePaths: [path.join(__dirname, 'public/styles/')],
	},

	i18n: {
		locales: ['en'],
		defaultLocale: 'en',
	},
};

export default nextConfig;
