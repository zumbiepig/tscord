import { Service } from '@/utils/decorators';

@Service()
export class EventManager {
	private _events = new Map<string, ((..._: unknown[]) => unknown)[]>();

	register(eventName: string, callback: (..._: unknown[]) => unknown): void {
		this._events.set(eventName, [
			...(this._events.get(eventName) ?? []),
			callback,
		]);
	}

	async emit(eventName: string, ...args: unknown[]): Promise<void> {
		const callbacks = this._events.get(eventName);
		if (callbacks) await Promise.all(callbacks.map(callback => callback(...args)));
	}
}
