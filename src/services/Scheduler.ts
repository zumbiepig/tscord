import { CronJob, type CronOnCompleteCommand } from 'cron';

import { Service } from '@/utils/decorators';

@Service()
export class Scheduler {
	private _jobs = new Map<
		string,
		CronJob<CronOnCompleteCommand | null, unknown>
	>();

	get jobs() {
		return this._jobs;
	}

	addJob(jobName: string, job: CronJob<CronOnCompleteCommand | null, unknown>) {
		this._jobs.set(jobName, job);
	}

	startJob(jobName: string) {
		this._jobs.get(jobName)?.start();
	}

	stopJob(jobName: string) {
		this._jobs.get(jobName)?.stop();
	}

	stopAllJobs() {
		this._jobs.forEach((job) => {
			job.stop();
		});
	}

	startAllJobs() {
		this._jobs.forEach((job) => {
			job.start();
		});
	}
}
