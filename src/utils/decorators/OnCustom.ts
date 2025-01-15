import { container, type InjectionToken } from 'tsyringe';

import { resolveDependency } from '@/utils/functions';

export function OnCustom(event: string) {
	return function (
		target: object,
		_propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		// associate the context to the function, with the injected dependencies defined
		const oldDescriptor = descriptor.value;
		descriptor.value = function (...args: unknown[]) {
			return this !== undefined
				? oldDescriptor.apply(
						container.resolve(this.constructor as InjectionToken),
						args,
					)
				: oldDescriptor.apply(this, args);
		};

		import('@/services')
			.then(async ({ EventManager }) => {
				const eventManager = await resolveDependency(EventManager);
				const callback = descriptor.value.bind(target);

				eventManager.register(event, callback);
			})
			.catch(() => {
				throw new Error('Failed to register event');
			});
	};
}
