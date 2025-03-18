import { SlashGroup as SlashGroupX } from 'discordx';

import { getLocalizedOptions } from '@/utils/functions';
import type { LocalizedOptions, SlashGroupOptions } from '@/utils/types';

export function SlashGroup<T extends string, TD extends string, TR extends string>(
	...[nameOrOptions, root]: SlashGroupOptions<T, TD, TR>
) {
	if (typeof nameOrOptions === 'string')
		return root === undefined
			? SlashGroupX<T>(...([nameOrOptions] as Parameters<typeof SlashGroupX<T>>))
			: SlashGroupX<T, TD>(...([nameOrOptions, root] as Parameters<typeof SlashGroupX<T, TD>>));
	else
		return SlashGroupX<T, TD, TR>(
			getLocalizedOptions<Parameters<typeof SlashGroupX<T, TD, TR>>[0]>(
				...([nameOrOptions] as LocalizedOptions<Parameters<typeof SlashGroupX<T, TD, TR>>>),
			),
		);
}
