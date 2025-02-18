import { singleton } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';

export const keptInstances = new Set<constructor<unknown>>();

export function Service<T>(persistAfterReload = false) {
	return (target: constructor<T>) => {
		if (persistAfterReload) keptInstances.add(target);
		singleton()(target);
	};
}
