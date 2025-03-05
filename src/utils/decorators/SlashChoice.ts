import { SlashChoice as SlashChoiceX } from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type {
	SlashChoiceOptions,
	TranslationPaths,
} from '@/utils/types';

export function SlashChoice (...options: string[]|number[]|SlashChoiceOptions[]) {
	options.map(option => {
		if (typeof option === 'object' && option.localizationSource)
			return setOptionsLocalization({
				target: 'name',
				options: option,
				localizationSource: constantPreserveDots(
					option.localizationSource,
				) as TranslationPaths,
			})
		else return option;
	})

	const optionsType = typeof options[0]; // for proper type inference
	if (optionsType === 'object') return SlashChoiceX(...(options as SlashChoiceOptions[]));
	else if (optionsType === 'string') return SlashChoiceX(...(options as string[]));
	else if (optionsType === 'number') return SlashChoiceX(...(options as number[]));
	else return SlashChoiceX(...(options as never[]));
};
