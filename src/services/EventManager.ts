import { Service } from '@/decorators';
import { Logger } from '@/services';

@Service()
export class EventManager {
	private _events = new Map<string, Function[]>();

	constructor(private logger: Logger) {}

	register(eventName: string, callback: Function): void {
		this._events.set(eventName, [
			...(this._events.get(eventName) ?? []),
			callback,
		]);
	}

	async emit(eventName: string, ...args: unknown[]): Promise<void> {
		const callbacks = this._events.get(eventName);

		if (!callbacks) return;

		for (const callback of callbacks) {
			try {
				await callback(...args);
			} catch (error) {
				console.error(error);
				if (error instanceof Error)
					this.logger.log(
						`[EventError - ${eventName}] ${error.toString()}`,
						'error',
						true,
					);
			}
		}
	}
}
