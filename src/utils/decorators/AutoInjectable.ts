import { autoInjectable } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';

export function AutoInjectable<T>() {
	return function (target: constructor<T>): (constructor<T>) {
		return autoInjectable()(target) as constructor<T>;
	};
}
