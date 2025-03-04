import { singleton } from 'tsyringe';
import type {constructor} from 'tsyringe/dist/typings/types';

export const persistedServices = new Set<constructor<unknown>>();

export function Service<T>(persistAfterReload = false) {
	return (target: constructor<T>) => {
		if (persistAfterReload) persistedServices.add(target);

		singleton()(target);
	};
}
