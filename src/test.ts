import { createReadStream, createWriteStream } from 'node:fs';

const sources = ['a.txt', 'b.txt', 'c.txt'];
const writer = createWriteStream('abc.txt');
for (const source of sources) {
	createReadStream(source).pipe(writer, { end: false });
}
