import { CronJob, type CronOnCompleteCommand } from 'cron';

import { Service } from '@/utils/decorators';

@Service()
export class Scheduler {
	private _jobs = new Map<string, CronJob<CronOnCompleteCommand, unknown>>();

	get jobs() {
		return this._jobs;
	}

	addJob(jobName: string, job: CronJob<CronOnCompleteCommand, unknown>) {
		this._jobs.set(jobName, job);
	}

	startJob(jobName: string) {
		this._jobs.get(jobName)?.start();
	}

	stopJob(jobName: string) {
		this._jobs.get(jobName)?.stop();
	}

	stopAllJobs() {
		for (const job of this._jobs) {
			job.stop();
		}
	}

	startAllJobs() {
		for (const job of this._jobs) {
			job.start();
		}
	}
}
