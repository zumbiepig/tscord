import { cpus } from 'node:os';
import { setTimeout } from 'node:timers/promises';

// Function to calculate CPU usage over 500ms
async function getProcessCPUUsage() {
	const startUsage = process.cpuUsage();
	const startTime = process.hrtime.bigint(); // High-resolution real time

	await setTimeout(500); // Measure over 500 ms

	const endUsage = process.cpuUsage(startUsage); // Delta since startUsage
	const elapsedTime = process.hrtime.bigint() - startTime; // elapsed nanoseconds

	const elapsedMicroseconds = Number(elapsedTime / 1000n); // Convert to microseconds
	const cpuTime = endUsage.user + endUsage.system; // Total CPU time in microseconds

	// Calculate CPU usage percentage
	const cpuUsagePercent =
		(cpuTime / (elapsedMicroseconds * cpus().length)) * 100;

	return cpuUsagePercent;
}
