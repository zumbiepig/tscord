//import { autoInjectable } from 'tsyringe';
//import type { constructor } from 'tsyringe/dist/typings/types';

import { Decorator } from "discordx";

/* export function AutoInjectable2<T>(): ClassDecoratorContext {
	return function (target: constructor<T>): constructor<T> {
		return autoInjectable()(target) as constructor<T>;
	};
}

export function AutoInjectable<T>(target: T): T {
	return autoInjectable()(target);
}
*/
/*
export function loggedMethod(headMessage = 'LOG:') {
	return function actualDecorator<This, Args extends unknown[], Return>(
		target: (this: This, ...args: Args) => Return,
		context: ClassMethodDecoratorContext<
			This,
			(this: This, ...args: Args) => Return
		>,
	) {
		const methodName = String(context.name);

		return function (this: This, ...args: Args): Return {
			console.log(`${headMessage} Entering method '${methodName}'.`);
			const result = target.call(this, ...args);
			console.log(`${headMessage} Exiting method '${methodName}'.`);
			return result;
		}
	};
}*/

type Decorator<T> = (value: T, context: DecoratorContext) => T;

function loggedMethod<T>(originalMethod: T, context: DecoratorContext): Decorator<T> {
	return function replacementMethod(this, ...args) {
		console.log('LOG: Entering method.' + context.name);
		const result = originalMethod.call(this, ...args);
		console.log('LOG: Exiting method.');
		return result;
	}
}

class Person {
	name: string;
	constructor(name: string) {
		this.name = name;
	}

	@loggedMethod
	greet() {
		console.log(`Hello, my name is ${this.name}.`);
	}
}

const p = new Person('Ron');
p.greet();

// Output:
//
//   LOG: Entering method.
//   Hello, my name is Ron.
//   LOG: Exiting method.
