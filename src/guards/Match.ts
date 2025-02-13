import type { ArgsOf, GuardFunction } from 'discordx';

/**
 * Pass only when the message match with a passed regular expression
 * @param regex The regex to test
 */
export const Match =
	(regex: RegExp): GuardFunction<ArgsOf<'messageCreate'>> =>
	async ([message], _client, next) => {
		if (regex.exec(message.content)) return next();
		else return;
	};
