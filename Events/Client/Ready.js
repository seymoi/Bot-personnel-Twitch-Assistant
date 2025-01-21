const Event = require("../../Structures/Classes/BaseEvent");
const { CommandHandler } = require("../../Structures/Handlers/CommandHandler");
const {
  ComponentHandler,
} = require("../../Structures/Handlers/ComponentHandler");
const { loadLanguages } = require("../../Structures/Handlers/LanguageHandler");
const { ConnectMongo, cleanOldBackups, createBackup } = require("../../Schemas/index");
const { Events, ActivityType, PresenceUpdateStatus } = require("discord.js");
const { Logger } = require("../../Structures/Functions/index");
const TwitchAlert = require("../../Structures/Functions/TwitchAlert");
const logger = new Logger();

class Ready extends Event {
  constructor(client) {
    super(client, {
      name: Events.ClientReady,
    });
  }

  async execute(client) {
    setInterval(() => {
      const activitys = [
        {
          name: `SEY`,
          type: ActivityType.Listening,
        },
        {
          name: `Under Development`,
          type: ActivityType.Custom,
        },
        {
          name: `seymoii on twitch`,
          type: ActivityType.Streaming,
          url: "https://twitch.tv/seymoii",
        },
      ];
      const activity = activitys[Math.floor(Math.random() * activitys.length)];
      client.user.setActivity(activity);
      client.user.setStatus(PresenceUpdateStatus.Idle);
    }, 10000);

    const { loadCommands } = new CommandHandler();
    const { loadComponents } = new ComponentHandler();

    try {
      await ConnectMongo(client);
    } catch (error) {
      logger.error(error);
    }

    try {
      await TwitchAlert(client);
      await loadLanguages();
      await loadCommands(client, client.config.deploySlashOnReady);
      await loadComponents(client);
    } catch (error) {
      logger.error(error);
    }

    logger.success(`${client.user.username}(#${client.cluster.id}) is ready!`);


  }
}

module.exports = Ready;
