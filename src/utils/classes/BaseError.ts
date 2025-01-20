import process from 'node:process';

export abstract class BaseError extends Error {
	abstract handle(): void;

	kill() {
		process.exit(1);
	}
}
