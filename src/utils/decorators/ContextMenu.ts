import { ContextMenu as ContextMenuX } from 'discordx';

import { constantPreserveDots, setOptionsLocalization } from '@/utils/functions';
import type { ContextMenuOptions } from '@/utils/types';

export function ContextMenu<T extends string>(...[options]: ContextMenuOptions<T>[1]) {
	if (!options.localizationSource && options.name)
		options.localizationSource =
			`COMMANDS.${constantPreserveDots(options.name)}` as ContextMenuOptions<T>['localizationSource'];

	const options2 = setOptionsLocalization<Parameters<typeof ContextMenuX>[0]>(options);

	return ContextMenuX(options2);
}
