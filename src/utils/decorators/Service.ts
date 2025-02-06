import { singleton } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';

export const keptInstances = new Set<constructor<unknown>>();

export function Service<T>(keepInstanceAfterReload?: boolean) {
	return function (target: constructor<T>) {
		if (keepInstanceAfterReload) keptInstances.add(target);

		singleton()(target);
	};
}
