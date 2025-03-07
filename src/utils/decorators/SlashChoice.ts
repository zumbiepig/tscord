import { SlashChoice as SlashChoiceX, type ParameterDecoratorEx } from 'discordx';

import {
	setOptionsLocalization,
} from '@/utils/functions';
import type {
	SlashChoiceOptions,
} from '@/utils/types';

export function SlashChoice<T extends string, X = string | number> (...choices: SlashChoiceOptions<T, X>[]) {
	return SlashChoiceX(...(typeof choices[0] === 'object' ? (choices).map(choice => setOptionsLocalization(choice)) : choices) as Parameters<typeof SlashChoiceX>);
};

SlashChoice(1, 2, '1', {localizationSource: 'COMMANDS.MAINTENANCE'})