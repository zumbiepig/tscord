import { env } from 'bun';
import { cleanEnv, host, port, str } from 'envalid';

import { apiConfig, generalConfig, mikroORMConfig } from '@/configs';

export default cleanEnv(env, {
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
		mikroORMConfig[
			env.NODE_ENV === 'development' ? 'development' : 'production'
		];

	cleanEnv(env, {
		NODE_ENV: str({ choices: ['production', 'development'] }),

		BOT_TOKEN: str(),

		DATABASE_HOST: host(
			!config.dbName && config.port ? { default: undefined } : undefined,
		),
		DATABASE_PORT: port(
			!config.dbName && config.port ? { default: undefined } : undefined,
		),
		DATABASE_NAME: str(
			!config.dbName && config.port ? { default: undefined } : undefined,
		),
		DATABASE_USER: str(
			!config.dbName && config.port ? { default: undefined } : undefined,
		),
		DATABASE_PASSWORD: str(
			!config.dbName && config.port ? { default: undefined } : undefined,
		),

		API_PORT: port(apiConfig.enabled ? { default: undefined } : undefined),
		API_ADMIN_TOKEN: str(
			apiConfig.enabled ? { default: undefined } : undefined,
		),

		IMGUR_CLIENT_ID: str(
			generalConfig.automaticUploadImagesToImgur
				? { default: undefined }
				: undefined,
		),
	});
};
