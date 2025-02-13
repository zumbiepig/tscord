import { singleton } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';
import type { Class } from 'type-fest';

export const keptInstances = new Set<constructor<unknown>>();

export function Service<T>(persistAfterReload = false) {
	return function (target: Class<T>) {
		if (persistAfterReload) keptInstances.add(target);
		singleton()(target);
	};
}
