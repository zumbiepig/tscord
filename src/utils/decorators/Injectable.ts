import { injectable } from 'tsyringe';
import type { constructor } from 'tsyringe/dist/typings/types';

export function Injectable<T>() {
	return function (target: constructor<T>) {
	 	injectable()(target);
	};
}
