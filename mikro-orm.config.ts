import 'reflect-metadata';

import { defineConfig } from '@mikro-orm/core';

import { mikroORMConfig } from './src/configs/database';

export default () => {
	return defineConfig({
		...mikroORMConfig[
			process.env.NODE_ENV === 'production' ? 'production' : 'development'
		],
		entities: [`src/entities/*.ts`, `src/plugins/*/entities/*.ts`],
	});
};
