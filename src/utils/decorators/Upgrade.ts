/* eslint-disable */

/*type Stage2Decorator = (
  target: object,
  propertyKey?: string | symbol,
  descriptor?: PropertyDescriptor
) => void;

type Stage3Decorator = <T>(
  target: T | undefined,
  context:
    | ClassDecoratorContext
    | ClassMethodDecoratorContext
    | ClassGetterDecoratorContext
    | ClassSetterDecoratorContext
    | ClassFieldDecoratorContext
    | ClassAccessorDecoratorContext
) => T | undefined;

export function Upgrade<T>(
	decorator:
		| ClassDecorator
		| PropertyDecorator
		| MethodDecorator
		| ParameterDecorator,
): Decorator<T> {
	return function (
		target: (...args: unknown[]) => T,
		context: DecoratorContext,
	) {
		switch (context.kind) {
			case 'class': {
				(decorator as ClassDecorator)(target);
				break;
			}
			case 'method': {
				const descriptor = Object.getOwnPropertyDescriptor(
					target,
					context.name,
				) as TypedPropertyDescriptor<T> | undefined;
				(decorator as MethodDecorator)(target, context.name, descriptor);
				Object.defineProperty(target, context.name, descriptor);
				break;
			}
			case 'getter': {
				break;
			}
			case 'setter': {
				break;
			}
			case 'field': {
				break;
			}
			case 'accessor': {
				break;
			}
		}
	};
}*/

import "reflect-metadata";

type DecoratorContext =
  | ClassDecoratorContext
  | ClassMethodDecoratorContext
  | ClassGetterDecoratorContext
  | ClassSetterDecoratorContext
  | ClassFieldDecoratorContext
  | ClassAccessorDecoratorContext;

type Stage2Decorator =
  | ClassDecorator
  | MethodDecorator
  | PropertyDecorator
  | ParameterDecorator;

// Helper function to convert a Stage 2 decorator into a Stage 3 decorator
function convertToStage3(stage2Decorator: Stage2Decorator) {
  return function (target: Function, context: DecoratorContext | { kind: "parameter"; name: string | symbol; parameterIndex: number }) {
    const { kind } = context;

    switch (kind) {
      case "class": {
        const classContext = context as ClassDecoratorContext;
        stage2Decorator(target);
        break;
      }

      case "method":
      case "getter":
      case "setter":
      case "accessor": {
        const memberContext = context as
          | ClassMethodDecoratorContext
          | ClassGetterDecoratorContext
          | ClassSetterDecoratorContext
          | ClassAccessorDecoratorContext;

        const descriptor = Object.getOwnPropertyDescriptor(
          memberContext.static ? memberContext.target : memberContext.target.prototype,
          memberContext.name
        );

        if (descriptor) {
          stage2Decorator(
            memberContext.target.prototype,
            memberContext.name,
            descriptor
          );
          Object.defineProperty(memberContext.target.prototype, memberContext.name, descriptor);
        }

        // Support reflect-metadata
        const metadataKeys = Reflect.getMetadataKeys(target, memberContext.name);
        for (const key of metadataKeys) {
          const metadataValue = Reflect.getMetadata(key, target, memberContext.name);
          Reflect.defineMetadata(key, metadataValue, memberContext.target.prototype, memberContext.name);
        }
        break;
      }

      case "field": {
        const fieldContext = context as ClassFieldDecoratorContext;
        stage2Decorator(fieldContext.target.prototype, fieldContext.name);
        break;
      }

      case "parameter": {
        const paramContext = context as { kind: "parameter"; name: string | symbol; parameterIndex: number };
        stage2Decorator(target, paramContext.name, paramContext.parameterIndex);
        break;
      }

      default:
        throw new Error(`Unsupported decorator kind: ${kind}`);
    }
  };
}

// Example Stage 2 method decorator
function Log(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<any>
) {
  const originalMethod = descriptor.value!;
  descriptor.value = function (...args: unknown[]) {
    console.log(`Calling ${String(propertyKey)} with`, args);
    return originalMethod.apply(this, args);
  };
}

// Convert Log to a Stage 3 decorator
const LogStage3 = convertToStage3(Log);

// Example usage
class Example {
  @LogStage3
  greet(name: string): void {
    console.log(`Hello, ${name}`);
  }
}

const example = new Example();
example.greet("Alice");
