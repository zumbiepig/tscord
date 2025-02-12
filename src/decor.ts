import 'reflect-metadata'; // Needed for reflect-metadata
import type { constructor } from 'tsyringe/dist/typings/types/index.js';

// Helper function to convert a Stage 2 decorator to Stage 3
function convertToStage3<T>(
	stage2Decorator: ClassDecorator | PropertyDecorator | MethodDecorator,
): (target: constructor<T>, context: DecoratorContext) => void {
	return function (target: Function, context: DecoratorContext) {
		switch (context.kind) {
			case 'class':
				return (stage2Decorator as ClassDecorator)(target);
			case 'method':
			case 'getter':
			case 'setter':
			case 'accessor':
				return (stage2Decorator as MethodDecorator)(
					target,
					context.name,
					Object.getOwnPropertyDescriptor(
						context.static ? target : target.prototype,
						context.name,
					),
				);
			case 'field':
				(stage2Decorator as PropertyDecorator)(target, context.name);
				break;
		}
	};
}

// Example of Stage 2 decorator for method
function LogMethod<T>(
	target: T,
	propertyKey: string | symbol,
	descriptor: TypedPropertyDescriptor<T>,
): void {
	const originalMethod = descriptor.value!;
	descriptor.value = function (...args: unknown[]) {
		console.log(`Calling ${String(propertyKey)} with`, args);
		return originalMethod.apply(this, args);
	};
}
/*// Example of Stage 2 decorator for field
function LogField(
	target: unknown,
	propertyKey: string | symbol,
): void {
	Object.defineProperty(target, propertyKey, {
		get() {
			console.log(`Accessing field ${String(propertyKey)}:`, originalValue);
			return originalValue;
		},
		set(value: any) {
			console.log(`Setting field ${String(propertyKey)} to`, value);
			if (access.set) {
				access.set(value);
			} else {
				access.value = value;
			}
		},
	});
}*/

// Convert to Stage 3 decorators
const LogMethodStage3 = convertToStage3(LogMethod);
//const LogFieldStage3 = convertToStage3(LogField);

// Example usage:

// Class decorator
@LogMethodStage3
class Example {
	@LogFieldStage3
	myField: string = 'Hello';

	@LogMethodStage3
	greet(name: string): void {
		console.log(`Hello, ${name}`);
	}
}

const example = new Example();
example.greet('Alice'); // Will log method calls and parameter usage
console.log(example.myField); // Will log field access
example.myField = 'World'; // Will log field set
