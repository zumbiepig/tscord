import { env } from 'bun';
import { cleanEnv, host, port, str } from 'envalid';

import { apiConfig, generalConfig, mikroORMConfig } from '@/configs';

const optionalEnv = { default: undefined };

const config =
	mikroORMConfig[env.NODE_ENV === 'development' ? 'development' : 'production'];

export default cleanEnv(env, {
	NODE_ENV: str({ choices: ['production', 'development'] }),

	BOT_TOKEN: str(),

	DATABASE_HOST: host(!config.dbName && config.port ? optionalEnv : undefined),
	DATABASE_PORT: port(!config.dbName && config.port ? optionalEnv : undefined),
	DATABASE_NAME: str(!config.dbName && config.port ? optionalEnv : undefined),
	DATABASE_USER: str(!config.dbName && config.port ? optionalEnv : undefined),
	DATABASE_PASSWORD: str(
		!config.dbName && config.port ? optionalEnv : undefined,
	),

	API_PORT: port(apiConfig.enabled ? optionalEnv : undefined),
	API_ADMIN_TOKEN: str(apiConfig.enabled ? optionalEnv : undefined),

	IMGUR_CLIENT_ID: str(
		generalConfig.automaticUploadImagesToImgur ? optionalEnv : undefined,
	),
});
