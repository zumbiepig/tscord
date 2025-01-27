import type { BaseTranslation } from '../i18n-types.js';
export default ({
  GUARDS: {
    DISABLED_COMMAND: "Cette commande est désactivée.",
    MAINTENANCE: "Ce bot est en mode maintenance.",
    GUILD_ONLY: "Cette commande ne peut être utilisée qu'en serveur.",
    NSFW: "Cette commande ne peut être utilisée que dans un salon NSFW."
  },
  ERRORS: {
    UNKNOWN: "Une erreur est survenue."
  },
  SHARED: {
    NO_COMMAND_DESCRIPTION: "Aucune description fournie."
  },
  COMMANDS: {
    INVITE: {
      DESCRIPTION: "Invitez le bot sur votre serveur!",
      EMBED: {
        TITLE: "Invite moi sur ton serveur!",
        DESCRIPTION: "[Clique ici]({link}) pour m'inviter!"
      }
    },
    PREFIX: {
      NAME: "prefixe",
      DESCRIPTION: "Change le préfix du bot.",
      OPTIONS: {
        PREFIX: {
          NAME: "nouveau_prefix",
          DESCRIPTION: "Le nouveau préfix du bot."
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