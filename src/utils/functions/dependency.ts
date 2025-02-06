import { setTimeout } from 'node:timers/promises';

import { container, type InjectionToken } from 'tsyringe';

export async function resolveDependency<T>(
	token: InjectionToken<T>,
): Promise<T> {
	while (!container.isRegistered(token, true)) await setTimeout(50);
	return container.resolve(token);
}

export async function resolveDependencies<
	T extends readonly unknown[],
>(tokens: { [K in keyof T]: InjectionToken<T[K]> }): Promise<{
	[K in keyof T]: T[K];
}> {
	return Promise.all(
		tokens.map((token) => resolveDependency(token)) as { [K in keyof T]: T[K] },
	);
}
