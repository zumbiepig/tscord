import 'dotenv/config';

import { env as processEnv } from 'node:process';

import { cleanEnv, host, port, str } from 'envalid';

import { apiConfig, generalConfig } from '@/configs';
import { isSQLiteDatabase } from '@/utils/functions';

export const env = cleanEnv(processEnv, {
	NODE_ENV: str({ choices: ['production', 'development'] }),

	BOT_TOKEN: str(),

	DATABASE_HOST: host({ default: '' }),
	DATABASE_PORT: port({ default: -1 }),
	DATABASE_NAME: str({ default: '' }),
	DATABASE_USER: str({ default: '' }),
	DATABASE_PASSWORD: str({ default: '' }),

	API_PORT: port({ default: -1 }),
	API_ADMIN_TOKEN: str({ default: '' }),

	IMGUR_CLIENT_ID: str({ default: '' }),
});

export function validateEnv() {
	cleanEnv(processEnv, {
		NODE_ENV: str({ choices: ['production', 'development'] }),

		BOT_TOKEN: str(),

		...(!isSQLiteDatabase() && {
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
}
