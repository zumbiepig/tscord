import { SlashChoice as SlashChoiceX } from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type {
	SanitizedOptions,
	SlashChoiceType,
	TranslationPath,
} from '@/utils/types';

export const SlashChoice =(...options: SanitizedOptions[]) =>{
	for (let i = 0; i < options.length; i++) {
		let option = options[i];

		if (option && typeof option !== 'number' && typeof option !== 'string') {
			let localizationSource: TranslationPath | undefined;
			if (option.localizationSource)
				localizationSource = constantPreserveDots(
					option.localizationSource,
				) as TranslationPath;

			if (localizationSource) {
				option = setOptionsLocalization({
					target: 'description',
					options: option,
					localizationSource,
				});

				option = setOptionsLocalization({
					target: 'name',
					options: option,
					localizationSource,
				});
			}

			options[i] = option;
		}
	}

	if (typeof options[0] === 'string')
		return SlashChoiceX(...(options as string[]));
	else if (typeof options[0] === 'number')
		return SlashChoiceX(...(options as number[]));
	else return SlashChoiceX(...(options as SlashChoiceType[]));
}
