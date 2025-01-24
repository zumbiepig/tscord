import { container, type InjectionToken } from 'tsyringe';

import { EventManager } from '@/services';
import { resolveDependency } from '@/utils/functions';

const eventManager = await resolveDependency(EventManager);

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

		eventManager.register(
			event,
			(descriptor.value as (...args: unknown[]) => unknown).bind(target),
		);
	};
}
