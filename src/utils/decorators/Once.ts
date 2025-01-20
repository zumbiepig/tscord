import {
	DOn,
	type EventOptions,
	MetadataStorage,
	type MethodDecoratorEx,
} from 'discordx';

/**
 * Handle both discord and custom events only **once** with a defined handler
 * @param event - event name
 * @param options - event parameters
 * ___
 *
 * [View Documentation](https://discord-ts.js.org/docs/decorators/general/on)
 *
 * @category Decorator
 */
export function Once(event: string, options?: EventOptions): MethodDecoratorEx {
	return function <T>(
		target: Record<string, T>,
		key: string,
		descriptor?: PropertyDescriptor,
	) {
		const clazz = target as unknown as new () => unknown;
		const on = DOn.create({
			...(options?.botIds !== undefined && { botIds: options.botIds }),
			event,
			once: true,
			rest: false,
		}).decorate(
			clazz.constructor,
			key,
			descriptor?.value as Record<string, never> | undefined,
		);

		MetadataStorage.instance.addOn(on);
	};
}
