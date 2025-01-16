import { container, type InjectionToken } from 'tsyringe';

import { resolveDependency } from '@/utils/functions';

export function OnCustom(event: string) {
	return function (
		target: unknown,
		_propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		// associate the context to the function, with the injected dependencies defined
		const oldDescriptor = descriptor.value as (...args: unknown[]) => unknown;
		descriptor.value = function (...args: unknown[]) {
			return oldDescriptor.apply(
				container.resolve(this.constructor as InjectionToken),
				args,
			);
		};

		import('@/services')
			.then(async ({ EventManager }) => {
				const eventManager = await resolveDependency(EventManager);
				const callback = (
					descriptor.value as (...args: unknown[]) => unknown
				).bind(target);
				eventManager.register(event, callback);
			})
			.catch(() => {
				throw new Error('Failed to register event');
			});
	};
}
