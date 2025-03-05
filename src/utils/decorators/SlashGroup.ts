import {
	SlashGroup as SlashGroupX,
	type SlashGroupOptions as SlashGroupOptionsX,
	type VerifyName,
} from 'discordx';

import {
	constantPreserveDots,
	setOptionsLocalization,
} from '@/utils/functions';
import type { SlashGroupOptions, TranslationPaths } from '@/utils/types';

export function SlashGroup <TRoot extends string>(
	options: VerifyName<string> | SlashGroupOptions,
	root?: VerifyName<TRoot>,
) {
	if (typeof options !== 'string') {
		let localizationSource: TranslationPaths | undefined;
		if (options.localizationSource)
			localizationSource = constantPreserveDots(
				options.localizationSource,
			) as TranslationPaths;

		if (localizationSource)
			options = setOptionsLocalization({
				target: 'name_and_description',
				options,
				localizationSource,
			});

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
