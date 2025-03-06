import { SlashChoice as SlashChoiceX } from 'discordx';

import {
	setOptionsLocalization,
} from '@/utils/functions';
import type {
	SlashChoiceOptions,
} from '@/utils/types';

export function SlashChoice (...choices: SlashChoiceOptions[]|string[]|number[]) {
	return SlashChoiceX(...(typeof choices[0] === 'object' ? (choices as SlashChoiceOptions[]).map(choice => setOptionsLocalization(choice)) : choices as SlashChoiceOptions[])); // no combined overload
};
