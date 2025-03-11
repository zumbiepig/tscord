import process from 'node:process';

abstract class BaseError extends Error {
	public shouldKill = false;

	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this.name = 'BaseError';
	}

	async handle(): Promise<void> {
		console.error(this.message);
	}

	kill(): never {}
}

class RegularError extends BaseError {
	constructor(...args: ConstructorParameters<typeof BaseError>) {
		super(...args);
	}

	async handle() {
		super.handle();
		console.error('This is a regular error');
	}
}

class FatalError extends BaseError {
	constructor(...args: ConstructorParameters<typeof BaseError>) {
		super(...args);
	}

	async handle() {
		super.handle();
		console.error('This is a fatal error');
		this.kill();
	}
}

class ErrorHandler {
	constructor() {
		process.on('uncaughtException', (error: Error, origin: string) => {
			console.error('uncaughtException', error);
			if (error instanceof BaseError) {
				void error.handle();
			}
		});

		process.on('unhandledRejection', (error: Error) => {
			console.error('unhandledRejection', error);
			if (error instanceof BaseError) {
				void error.handle();
			}
		});
	}
}

class thisWillThrow {
	constructor() {
		throw new RegularError('regular error msg');
	}
}

class thisWillThrowFatal {
	constructor() {
		throw new FatalError('FATAL error msg');
	}
}

new ErrorHandler();
console.log('start');
console.log('throwing regular error');
//new thisWillThrow();
console.log('threw regular error');
console.log('throwing fatal error');
new thisWillThrowFatal();
console.log('threw fatal error');
console.log('end');
