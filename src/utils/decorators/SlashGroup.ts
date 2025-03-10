import { SlashGroup as SlashGroupX } from 'discordx';

import { setOptionsLocalization } from '@/utils/functions';
import type { SlashGroupOptions } from '@/utils/types';

export function SlashGroup<T extends string = never, TD extends string = never, TR extends string = never>(
	...[nameOrOptions, root]: SlashGroupOptions<T, TD, TR>[1]
) {
	if (typeof nameOrOptions === 'string') return root === undefined ? SlashGroupX<T>(nameOrOptions as Parameters<typeof SlashGroupX<T>>[0]) : SlashGroupX<T, TD>(nameOrOptions as Parameters<typeof SlashGroupX<T, TD>>[0], root);
	else return SlashGroupX<T, TD, TR>(setOptionsLocalization(nameOrOptions));
}
