import type { BaseTranslation } from '../i18n-types.js';
export default ({
  GUARDS: {
    DISABLED_COMMAND: "Эта команда на данный момент не доступна.",
    MAINTENANCE: "Бот закрыт на техническое обслуживание.",
    GUILD_ONLY: "Эту команду можно использовать только на сервере.",
    NSFW: "Эта команда доступна только в чатах 18+."
  },
  ERRORS: {
    UNKNOWN: "Произошла непонятная ошибка."
  },
  SHARED: {
    NO_COMMAND_DESCRIPTION: 'No description provided.'
  },
  COMMANDS: {
    INVITE: {
      DESCRIPTION: "Пригласить бота на свой сервер!",
      EMBED: {
        TITLE: "Хочешь видеть меня у себя на сервере?",
        DESCRIPTION: '[Click here]({link}) to invite me!'
      }
    },
    PREFIX: {
      NAME: 'prefix',
      DESCRIPTION: 'Change the prefix of the bot.',
      OPTIONS: {
        PREFIX: {
          NAME: 'new_prefix',
          DESCRIPTION: 'The new prefix of the bot.'
        }
      },
      EMBED: {
        DESCRIPTION: 'Prefix changed to `{prefix:string}`.'
      }
    },
    MAINTENANCE: {
      DESCRIPTION: 'Set the maintenance mode of the bot.',
      EMBED: {
        DESCRIPTION: 'Maintenance mode set to `{state:string}`.'
      }
    },
    STATS: {
      DESCRIPTION: 'Get some stats about the bot.',
      HEADERS: {
        COMMANDS: 'Commands',
        GUILDS: 'Guild',
        ACTIVE_USERS: 'Active Users',
        USERS: 'Users'
      }
    },
    HELP: {
      DESCRIPTION: 'Get global help about the bot and its commands',
      EMBED: {
        TITLE: 'Help panel',
        CATEGORY_TITLE: '{category:string} Commands'
      },
      SELECT_MENU: {
        TITLE: 'Select a category',
        CATEGORY_DESCRIPTION: '{category:string} commands'
      }
    },
    PING: {
      DESCRIPTION: 'Pong!',
      MESSAGE: '{member:string} Pong! The message round-trip took {time:number}ms.{heartbeat:string}'
    }
  }
} as BaseTranslation);