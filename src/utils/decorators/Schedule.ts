import { type CronCommand, CronJob } from 'cron';
import { isValidCron } from 'cron-validator';
import { container, type InjectionToken } from 'tsyringe';

import { generalConfig } from '@/configs';
import { Scheduler } from '@/services';
import { resolveDependency } from '@/utils/functions';

const scheduler = await resolveDependency(Scheduler);

/**
 * Schedule a job to be executed at a specific time (cron)
 * @param cronExpression - cron expression to use (e.g: "0 0 * * *" will run each day at 00:00)
 * @param jobName - name of the job (the name of the function will be used if it is not provided)
 */
export function Schedule(cronExpression: string, jobName?: string) {
	if (!isValidCron(cronExpression, { alias: true, seconds: true }))
		throw new Error(`Invalid cron expression: ${cronExpression}`);

	return (
		target: unknown,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) => {
		// associate the context to the function, with the injected dependencies defined
		const oldDescriptor = descriptor.value as (...args: unknown[]) => unknown;
		descriptor.value = function (...args: unknown[]) {
			return oldDescriptor.apply(
				container.resolve(this.constructor as InjectionToken),
				args,
			);
		};

		const job = new CronJob(
			cronExpression,
			descriptor.value as CronCommand<unknown>,
			null,
			false,
			generalConfig.timezone,
			target,
		);

		scheduler.addJob(jobName ?? propertyKey, job);
	};
}
