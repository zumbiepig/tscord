import { Logger } from '@/services';
import { Service } from '@/utils/decorators';

@Service()
export class EventManager {
	private _events = new Map<string, ((..._: unknown[]) => unknown)[]>();

	constructor(private logger: Logger) {}

	register(eventName: string, callback: (..._: unknown[]) => unknown): void {
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
					await this.logger.log(
				'error',
						`[EventError - ${eventName}] ${error instanceof Error ? error.message : String(error)}`,
					);
			}
		}
	}
}
