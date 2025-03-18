import { SlashChoice as SlashChoiceX } from 'discordx';

import { getLocalizedOptions } from '@/utils/functions';
import type { LocalizedOptions, SlashChoiceOptions } from '@/utils/types';

export function SlashChoice<T extends string, X = string | number>(...choices: SlashChoiceOptions<T, X>) {
	if (typeof choices[0] === 'string') return SlashChoiceX<T>(...(choices as Parameters<typeof SlashChoiceX<T>>));
	else if (typeof choices[0] === 'number') return SlashChoiceX(...(choices as Parameters<typeof SlashChoiceX>));
	else
		return SlashChoiceX<T, X>(
			...(choices as LocalizedOptions<Parameters<typeof SlashChoiceX<T, X>>>).map((choice) =>
				getLocalizedOptions<Parameters<typeof SlashChoiceX<T, X>>[number]>(choice),
			),
		);
}
