import 'reflect-metadata';

import { defineConfig } from '@mikro-orm/core';
import { env } from 'bun';

import { mikroORMConfig } from '@/configs';

export default () => {
	return defineConfig({
		...mikroORMConfig[
			env.NODE_ENV === 'production' ? 'production' : 'development'
		],
		entities: [`src/entities/*.ts`, `src/plugins/*/entities/*.ts`],
	});
};
