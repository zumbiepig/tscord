import { container, type InjectionToken } from 'tsyringe';

import { EventManager } from '@/services';
import { resolveDependency } from '@/utils/functions';

export function OnCustom(event: string) {
	return function (target: unknown, context: ClassMethodDecoratorContext) {
		// associate the context to the function, with the injected dependencies defined
		const oldDescriptor = target as (...args: unknown[]) => unknown;
		descriptor.value = function (...args: unknown[]) {
			return oldDescriptor.apply(
				container.resolve(this.constructor as InjectionToken),
				args,
			);
		};

		void resolveDependency(EventManager).then((eventManager) => {
			eventManager.register(
				event,
				(descriptor.value as (...args: unknown[]) => unknown).bind(target),
			);
		});
	};
}
