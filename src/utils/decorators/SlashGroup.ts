import {
	SlashGroup as SlashGroupX,
	type SlashGroupOptions as SlashGroupOptionsX,
	type VerifyName,
} from 'discordx';

import {
	constantPreserveDots,
	setFallbackDescription,
	setOptionsLocalization,
} from '@/utils/functions';
import type { SlashGroupOptions, TranslationPath } from '@/utils/types';

export function SlashGroup <TRoot extends string>(
	options: VerifyName<string> | SlashGroupOptions,
	root?: VerifyName<TRoot>,
) {
	if (typeof options !== 'string') {
		let localizationSource: TranslationPath | undefined;
		if (options.localizationSource)
			localizationSource = constantPreserveDots(
				options.localizationSource,
			) as TranslationPath;

		if (localizationSource) {
			options = setOptionsLocalization({
				target: 'description',
				options,
				localizationSource,
			});

			options = setOptionsLocalization({
				target: 'name',
				options,
				localizationSource,
			});
		}

		if (!options.description) options = setFallbackDescription(options);

		return SlashGroupX(
			options as SlashGroupOptionsX<
				VerifyName<string>,
				string,
				VerifyName<string>
			>,
		);
	} else {
		if (root) return SlashGroupX(options, root);
		else return SlashGroupX(options);
	}
};
