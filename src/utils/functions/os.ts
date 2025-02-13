import { cpus } from 'node:os';
import { setTimeout } from 'node:timers/promises';

export async function getProcessCPUUsage() {
	const startUsage = process.cpuUsage();
	const startNs = process.hrtime.bigint();

	await setTimeout(100);

	const endUsage = process.cpuUsage(startUsage);
	const elapsedNs = process.hrtime.bigint() - startNs;

	const busyUs = endUsage.user + endUsage.system;
	const elapsedUs = Number(elapsedNs / 1000n);

	const percent = (busyUs / (elapsedUs * cpus().length)) * 100;
	return percent;
}

export async function getHostCPUUsage() {
	const [startIdle, startTotal] = cpus().reduce<[number, number]>(
		(acc, { times }) => [
			acc[0] + times.idle,
			acc[1] + times.user + times.nice + times.sys + times.idle + times.irq,
		],
		[0, 0],
	);

	await setTimeout(100);

	const [endIdle, endTotal] = cpus().reduce<[number, number]>(
		(acc, { times }) => [
			acc[0] + times.idle,
			acc[1] + times.user + times.nice + times.sys + times.idle + times.irq,
		],
		[0, 0],
	);

	const percent = (1 - (endIdle - startIdle) / (endTotal - startTotal)) * 100;
	return percent;
}
