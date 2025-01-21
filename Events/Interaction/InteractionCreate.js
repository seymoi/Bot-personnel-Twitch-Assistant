const Event = require("../../Structures/Classes/BaseEvent");
const { jsonFind, Logger } = require("../../Structures/Functions/index");
const {
  languageDatas,
} = require("../../Schemas/index.js");
const { Events, InteractionType, EmbedBuilder, AttachmentBuilder, Colors } = require("discord.js");
const logger = new Logger();
const { t } = require("i18next");

class InteractionCreate extends Event {
  constructor(client) {
    super(client, {
      name: Events.InteractionCreate,
    });
  }
  /**
   *
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { client } = this;
    if (interaction.type !== InteractionType.ApplicationCommand) return;


    let guildData = await client.db.PluginsData.findOne({ guildId: interaction.guild.id });
    if (!guildData) {
      guildData = new client.db.PluginsData({ guildId: interaction.guild.id });
      await data.save().catch(error =>
        logger.error("Erreur lors de la sauvegarde des données :", error)
      );
    }
    // MEMBER
    const query = {
      guildId: interaction.guild.id,
      userId: interaction.user.id,
    };

    let Achdata = await client.db.AchievementsData.findOne(query);
    if (!Achdata) {
      Achdata = new client.db.AchievementsData(query)
      await Achdata.save().catch(error =>
        logger.error("Erreur lors de la sauvegarde des données :", error)
      );
    }

    let data = await client.db.MemberDatas.findOne(query);
    if (!data) {
      data = new client.db.MemberDatas(query)
      await data.save().catch(error =>
        logger.error("Erreur lors de la sauvegarde des données :", error)
      );
    }


    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    let languageData = await languageDatas.findOne({
      guildId: interaction.guildId,
    });
    if (!languageData && interaction.guildId !== null) {
      await languageDatas.create({
        guildId: interaction.guildId,
        lng: "fr",
      });
      languageData = await languageDatas.findOne({
        guildId: interaction.guildId,
      });
    }
    const lng = interaction.guildId == null ? "fr" : languageData.lng;

    if (
      command.options?.devOnly &&
      !jsonFind(interaction.user.id, client.config.developers)
    ) {
      return await interaction.reply({
        content: t("event.command.devOnly", {
          lng,
          client: client.user.username,
        }),
        ephemeral: true,
      });
    }

    if (
      client.config.underDevelopment &&
      !jsonFind(interaction.guild, client.config.devGuilds) &&
      !jsonFind(interaction.guild, client.config.betaTestGuilds)
    ) {
      return await interaction.reply({
        content: t("event.command.underDev", { lng }),
        ephemeral: true,
      });
    }
    if (command.options?.disabled && !jsonFind(interaction.user.id, client.config.developers)) {
      return interaction.reply({ content: `Cette commande n'est pas active en ce moment.`, ephemeral: true })
    }

    if (!Achdata.achievements.command.achieved) {
      Achdata.achievements.command.progress.now = 1;
      Achdata.achievements.command.achieved = true;
      data.currency += Achdata.achievements.command.reward;
      Achdata.markModified("achievements.command")
      await Achdata.save();
      await data.save();
      const attachment = new AttachmentBuilder("./assets/img/achievements/achievement_unlocked1.png", { name: "unlocked.png" });
      const embed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle(`\`🏆 Succès                        \``)
        .setFooter({ text: `Vous venez de gagner ${Achdata.achievements.command.reward} coins.` })
        .setImage("attachment://unlocked.png")
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      const channel = interaction.guild.channels.cache.get(guildData.plugins.levels.channel);
      if (channel) {
        channel.send({ content: `${interaction.user}`, embeds: [embed], files: [attachment] });
      } else {
        member.send({ embeds: [embed], files: [attachment], }).catch(() => { });
      }

    }

    try {
      await command.execute(interaction, client, lng);
    } catch (error) {
      logger.error(error);
      if (interaction.replied) {
        await interaction.editReply({
          content: t("event.command.fail", { lng }),
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: t("event.command.fail", { lng }),
          ephemeral: true,
        });
      }
    }
  }
}

module.exports = InteractionCreate;
