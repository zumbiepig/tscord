import type { BaseTranslation } from '../i18n-types.js';
export default ({
  GUARDS: {
    DISABLED_COMMAND: "Ця команда на разі відключена",
    MAINTENANCE: "На разі ведуться технічні роботи!",
    GUILD_ONLY: "Цю команду можна використовувати тільки на сервері!",
    NSFW: "Ця команда може бути використана тільки в каналі для дорослих!"
  },
  ERRORS: {
    UNKNOWN: "Сталася невідома помилка!"
  },
  SHARED: {
    NO_COMMAND_DESCRIPTION: "Опис відсутній."
  },
  COMMANDS: {
    INVITE: {
      DESCRIPTION: "Запросити бота до себе додому!",
      EMBED: {
        TITLE: "Запроси мене до себе на сервер!",
        DESCRIPTION: "[Тисни тут]({link}) щоб я мав доступ!"
      }
    },
    PREFIX: {
      NAME: 'prefix',
      DESCRIPTION: "Змінити префікс команд.",
      OPTIONS: {
        PREFIX: {
          NAME: 'new_prefix',
          DESCRIPTION: "Новий префікс для команд боту."
        }
      },
      EMBED: {
        DESCRIPTION: "Префікс змінено на `{prefix}`."
      }
    },
    MAINTENANCE: {
      DESCRIPTION: "Встановити режим проведення технічних робіт.",
      EMBED: {
        DESCRIPTION: "Режим технічних робіт встановлено на `{state}`."
      }
    },
    STATS: {
      DESCRIPTION: "Подивитись статистику бота.",
      HEADERS: {
        COMMANDS: 'Commands',
        GUILDS: "Гільдії",
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
        TITLE: "Вибери категорію",
        CATEGORY_DESCRIPTION: '{category:string} commands'
      }
    },
    PING: {
      DESCRIPTION: 'Pong!',
      MESSAGE: '{member:string} Pong! The message round-trip took {time:number}ms.{heartbeat:string}'
    }
  }
} as BaseTranslation);