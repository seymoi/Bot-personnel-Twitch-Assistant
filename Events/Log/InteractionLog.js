const Event = require("../../Structures/Classes/BaseEvent");
const { botDatas } = require("../../Schemas/index.js");
const {
  Events,
  CommandInteraction,
  InteractionType,
  EmbedBuilder,
  Colors,
} = require("discord.js");

class InteractionLog extends Event {
  constructor(client) {
    super(client, {
      name: Events.InteractionCreate,
    });
  }

  async execute(interaction) {
    const { client } = this;
    if (
      interaction instanceof CommandInteraction &&
      interaction.type === InteractionType.ApplicationCommand
    ) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      let botData = await botDatas.findOne({ password: "seymoi" });

      if (!botData) {
        await botDatas.create({ password: "seymoi" });
        botData = await botDatas.findOne({ password: "seymoi" });
      }
      const cmdsUsed = botData.cmdUsed;
      botData.cmdUsed += 1;
      botData.save();

      const channel = await client.channels.cache.get(client.config.logChannel);
      const server = interaction.guild?.name || "user";
      const user = interaction.user.username;
      const userId = interaction.user.id;

      const embed = new EmbedBuilder()
        .setDescription(`${cmdsUsed}th command`)
        .setColor(Colors.Green)
        .addFields({ name: "User", value: `${user} \`${userId}\`` })
        .addFields({ name: "Command", value: `${interaction}` })
        .addFields({
          name: "server id",
          value: `\`${interaction.guild?.id || "NuN"}\``,
        })
        .setFooter({ text: server })
        .setTimestamp();

      if (channel) {
        return channel.send({ embeds: [embed] });
      }
    }
  }
}

module.exports = InteractionLog;
