import { SlashChoice as SlashChoiceX } from 'discordx';

import { getLocalizedOptions } from '@/utils/functions';
import type { SlashChoiceOptions } from '@/utils/types';

export function SlashChoice<T extends string, X = string | number>(...choices: SlashChoiceOptions<T, X>) {
	if (typeof choices[0] === 'object')
		return SlashChoiceX<T, X>(
			...choices.map((choice) => getLocalizedOptions<Parameters<typeof SlashChoiceX<T, X>>[0]>(choice)),
		);
	else if (typeof choices[0] === 'string') return SlashChoiceX<T>(...(choices as string[]));
	else if (typeof choices[0] === 'number') return SlashChoiceX<>(...(choices as number[]));
}

SlashChoice('a', 111, {});
