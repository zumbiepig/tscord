import { container, type InjectionToken } from 'tsyringe';

export async function resolveDependency<T>(
	token: InjectionToken<T>,
	interval = 500,
) {
	while (!container.isRegistered(token, true))
		await new Promise((resolve) => setTimeout(resolve, interval));
	return container.resolve(token);
}

export async function resolveDependencies<
	T extends readonly (new (...args: never[]) => unknown)[],
>(tokens: [...T], interval = 500) {
	return Promise.all(
		tokens.map((token) =>
			resolveDependency(
				token as InjectionToken<InstanceType<T[number]>>,
				interval,
			),
		),
	) as Promise<{ [K in keyof T]: InstanceType<T[K]> }>;
}
