import process from 'node:process';

import { cleanEnv, host, port, str } from 'envalid';

import { apiConfig, generalConfig, mikroORMConfig } from '@/configs';

export default cleanEnv(process.env, {
	NODE_ENV: str({ choices: ['production', 'development'] }),

	BOT_TOKEN: str(),

	DATABASE_HOST: host({ default: undefined }),
	DATABASE_PORT: port({ default: undefined }),
	DATABASE_NAME: str({ default: undefined }),
	DATABASE_USER: str({ default: undefined }),
	DATABASE_PASSWORD: str({ default: undefined }),

	API_PORT: port({ default: undefined }),
	API_ADMIN_TOKEN: str({ default: undefined }),

	IMGUR_CLIENT_ID: str({ default: undefined }),
});

export const validateEnv = function () {
	const config =
		mikroORMConfig[process.env.NODE_ENV as 'production' | 'development'];

	cleanEnv(process.env, {
		NODE_ENV: str({ choices: ['production', 'development'] }),

		BOT_TOKEN: str(),

		...(!config.dbName &&
			config.port && {
				DATABASE_HOST: host(),
				DATABASE_PORT: port(),
				DATABASE_NAME: str(),
				DATABASE_USER: str(),
				DATABASE_PASSWORD: str(),
			}),

		...(apiConfig.enabled && {
			API_PORT: port(),
			API_ADMIN_TOKEN: str(),
		}),

		...(generalConfig.automaticUploadImagesToImgur && {
			IMGUR_CLIENT_ID: str(),
		}),
	});
};
