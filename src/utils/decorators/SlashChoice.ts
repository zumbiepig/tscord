import { SlashChoice as SlashChoiceX } from 'discordx';

import {
	setOptionsLocalization,
} from '@/utils/functions';
import type {
	SlashChoiceOptions,
} from '@/utils/types';

export function SlashChoice<T extends string, X = string | number> (...choices: SlashChoiceOptions<T, X>) {
	return SlashChoiceX(...(typeof choices[0] === 'object' ? (choices).map(choice => setOptionsLocalization(choice)) : choices) as Parameters<typeof SlashChoiceX>);
};

SlashChoice('a', 111, {})

type test = {foo?: string} | {bar?: string}
const a = {
	foo: 'foo',bar: 'bar',
} satisfies test




type Vehicle = {
	type: string;
	extra: string;
} & ({ type: 'car'; carSize: number; } | { type: 'bike'; bikeSize: number; });

const myCar: Vehicle = {
  type: 'car',
  extra: 'abc',
	carSize: 400,
}
const myBike: Vehicle = {
  type: 'bike',
  extra: 'def',
	bikeSize: 1,
}

const myCar2: Vehicle = { // <- myCar will show an error
  make: 'vw',
  model: 'golf',
  fuel: 'diesel',
  type: 'car',
};

const myBike2: Vehicle = {
  type: 'motorbike',
  make: 'honda',
  model: 'cbr',
  fuel: 'petrol',
  doors: 5, // <-- will error here
}
