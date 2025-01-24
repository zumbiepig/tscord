import process from 'node:process';

export abstract class BaseError extends Error {
	abstract handle(): void | Promise<void>;

	kill() {
		process.exit(1);
	}
}
