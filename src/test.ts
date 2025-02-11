//import os from 'node:os';
/*import process from 'node:process';

async function getCurrentCPUUsage() {
	const start = process.cpuUsage();
	// Run a busy-loop for specified # of milliseconds.
	const RUN_FOR_MS = 500;
	// Run a busy loop.
	await setTimeout(RUN_FOR_MS);
	// Get a diff reading from when we started.
	const diff = process.cpuUsage(start);

	let totalIdle = 0;
	let totalTick = 0;

	diff.forEach(({ times }) => {
		totalIdle += times.idle;
		totalTick += times.user + times.nice + times.sys + times.idle + times.irq;
	});

	return (totalIdle / totalTick) * 100;
}

console.log(`idle CPU Usage: ${getCurrentCPUUsage().toFixed(1)}%`);
*/
import { setTimeout } from 'node:timers/promises';

import os from 'node:os';
import pidusage from 'pidusage';

function stress(time: number) {
	const start = Date.now();
	while (Date.now() - start < time) {
		Math.floor(Math.random() * 1e9999999);
	}
}

// Function to calculate CPU usage over 500ms
async function getProcessCPUUsage(doStress = false) {
	const startUsage = process.cpuUsage();
	const startTime = process.hrtime(); // High-resolution real time

	const TIME = 1000;

	// Measure over 500 ms
	if (doStress) stress(TIME);
	else await setTimeout(TIME);

	const endUsage = process.cpuUsage(startUsage); // Delta since startUsage
	const elapsedTime = process.hrtime(startTime); // [seconds, nanoseconds]

	const elapsedMicros = elapsedTime[0] * 1e6 + elapsedTime[1] / 1e3; // Convert to microseconds
	const cpuTime = endUsage.user + endUsage.system; // Total CPU time in microseconds

	// Number of CPU cores
	const numCPUs = os.cpus().length;

	// Calculate CPU usage percentage
	const cpuUsagePercent = (cpuTime / (elapsedMicros * numCPUs)) * 100;

	return cpuUsagePercent;
}

let TIMES = 0;
let STRESS = true;

//await getProcessCPUUsage();
console.log(process.pid);
while (true) {
	if (TIMES++ % 5 === 0) STRESS = !STRESS;
	console.log(
		`Process CPU Usage (stress: ${STRESS ? ' true' : 'false'}): ${(await getProcessCPUUsage(STRESS)).toFixed(0)}%`,
	);
}
