import { singleton } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';

export const keptInstances = new Set<constructor<unknown>>();

export function Service<T>(keepInstanceAfterHmr?: boolean) {
	return function (target: constructor<T>) {
		if (keepInstanceAfterHmr) keptInstances.add(target);

		singleton()(target);
	};
}
