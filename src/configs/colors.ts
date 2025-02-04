import { Colors } from "discord.js";

import type { ColorsConfigType } from "@/utils/types";

/**
 * @typedef {Object} Colors
 * @property {number} Aqua 0x1ABC9C | rgb(26,188,156)
 * @property {number} Blue 0x3498DB | rgb(52,152,219)
 * @property {number} Blurple 0x5865F2 | rgb(88,101,242)
 * @property {number} DarkAqua 0x11806A | rgb(17,128,106)
 * @property {number} DarkBlue 0x206694 | rgb(32,102,148)
 * @property {number} DarkButNotBlack 0x2C2F33 | rgb(44,47,51)
 * @property {number} DarkerGrey 0x7F8C8D | rgb(127,140,141)
 * @property {number} DarkGold 0xC27C0E | rgb(194,124,14)
 * @property {number} DarkGreen 0x1F8B4C | rgb(31,139,76)
 * @property {number} DarkGrey 0x979C9F | rgb(151,156,159)
 * @property {number} DarkNavy 0x2C3E50 | rgb(44,62,80)
 * @property {number} DarkOrange 0xA84300 | rgb(168,67,0)
 * @property {number} DarkPurple 0x71368A | rgb(113,54,138)
 * @property {number} DarkRed 0x992D22 | rgb(153,45,34)
 * @property {number} DarkVividPink 0xAD1457 | rgb(173,20,87)
 * @property {number} Default 0x000000 | rgb(0,0,0)
 * @property {number} Fuchsia 0xEB459E | rgb(235,69,158)
 * @property {number} Gold 0xF1C40F | rgb(241,196,15)
 * @property {number} Green 0x57F287 | rgb(87,242,135)
 * @property {number} Grey 0x95A5A6 | rgb(149,165,166)
 * @property {number} Greyple 0x99AAb5 | rgb(153,170,181)
 * @property {number} LightGrey 0xBCC0C0 | rgb(188,192,192)
 * @property {number} LuminousVividPink 0xE91E63 | rgb(233,30,99)
 * @property {number} Navy 0x34495E | rgb(52,73,94) 
 * @property {number} NotQuiteBlack 0x23272A | rgb(35,39,42)
 * @property {number} Orange 0xE67E22 | rgb(230,126,34)
 * @property {number} Purple 0x9B59B6 | rgb(155,89,182)
 * @property {number} Red 0xED4245 | rgb(237,66,69)
 * @property {number} White 0xFFFFFF | rgb(255,255,255)
 * @property {number} Yellow 0xFEE75C | rgb(254,231,92)
 */
export const colorsConfig: ColorsConfigType = {
	primary: Colors.DarkButNotBlack, // #2f3136
	success: Colors.Green, // #57f287
	error: Colors.Red, // #ed4245
	logDebug: Colors.DarkerGrey, // #696969
	logInfo: Colors.Blue, // #007fe7
	logWarn: Colors.Orange, // #f37100
	logError: Colors.DarkRed, // #992d22
	logInteraction: Colors.DarkOrange, // #db5c21
	logNewUser: Colors.Aqua, // #83dd80
	logGuildNew: Colors.Green, // #02fd77
	logGuildDelete: Colors.Red, // #ff0000
	logGuildRecover: Colors.Yellow, // #fffb00
};
