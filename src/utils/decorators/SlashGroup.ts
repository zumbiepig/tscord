import {
	type ClassDecoratorEx,
	type ClassMethodDecorator,
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

/**
 * Create slash group
 *
 * @param options - Group options
 * ___
 *
 * [View discordx documentation](https://discordx.js.org/docs/discordx/decorators/command/slash-group)
 *
 * [View discord documentation](https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups)
 *
 * @category Decorator
 */
export function SlashGroup(options: SlashGroupOptions): ClassDecoratorEx;

/**
 * Assign a group to a method or class
 *
 * @param name - Name of group
 * ___
 *
 * [View discordx documentation](https://discordx.js.org/docs/discordx/decorators/command/slash-group)
 *
 * [View discord documentation](https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups)
 *
 * @category Decorator
 */
export function SlashGroup<TName extends string>(
	name: VerifyName<TName>,
): ClassMethodDecorator;

/**
 * Assign a group to a method or class
 *
 * @param name - Name of group
 * @param root - Root name of group
 * ___
 *
 * [View discordx documentation](https://discordx.js.org/docs/discordx/decorators/command/slash-group)
 *
 * [View discord documentation](https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups)
 *
 * @category Decorator
 */
export function SlashGroup<TName extends string, TRoot extends string>(
	name: VerifyName<TName>,
	root: VerifyName<TRoot>,
): ClassMethodDecorator;

/**
 * Assign a group to a method or class
 *
 * @param options - Group options or name
 * @param root - Root name of group
 * ___
 *
 * [View discordx documentation](https://discordx.js.org/docs/discordx/decorators/command/slash-group)
 *
 * [View discord documentation](https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups)
 *
 * @category Decorator
 */
export function SlashGroup<TRoot extends string>(
	options: VerifyName<string> | SlashGroupOptions,
	root?: VerifyName<TRoot>,
) {
	if (typeof options !== 'string') {
		let localizationSource: TranslationPath | null = null;
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
}
