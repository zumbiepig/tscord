/* eslint-disable @typescript-eslint/no-explicit-any */
import { setTimeout } from 'node:timers/promises';

import { container, type InjectionToken } from 'tsyringe';
import type { DelayedConstructor } from 'tsyringe/dist/typings/lazy-helpers.js';
import type { constructor } from 'tsyringe/dist/typings/types/index.js';
import type { Class } from 'type-fest';

export async function resolveDependency<T>(
	token: InjectionToken<T>,
): Promise<T> {
	while (!container.isRegistered(token, true)) await setTimeout(50);
	return container.resolve(token);
}

export async function resolveDependencies<T extends readonly Parameters<InjectionToken>[]>(
	tokens: { [K in keyof T]: InjectionToken<T[K]> },
): Promise<{ [K in keyof T]: T[K] }> {
	return Promise.all(
		tokens.map(token => resolveDependency(token)) as { [K in keyof T]: T[K] },
	);
}
