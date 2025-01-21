const Event = require("../../Structures/Classes/BaseEvent");
const { CommandHandler } = require("../../Structures/Handlers/CommandHandler");
const {
    ComponentHandler,
} = require("../../Structures/Handlers/ComponentHandler");
const {
    Events,
    CommandInteraction,
    InteractionType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    AttachmentBuilder,
    ActivityType,
    PresenceUpdateStatus,
    Colors,
} = require("discord.js");
const { LevelXp, Logger } = require("../../Structures/Functions/index");
const levelXp = new LevelXp();

const logger = new Logger();

class MessageCreate extends Event {
    constructor(client) {
        super(client, {
            name: Events.MessageCreate,
        });
    }

    async execute(message) {
        const { client } = this;
        if (!message.guild || message.author.bot) return;
        // GUILD
        let guildData = await client.db.PluginsData.findOne({ guildId: message.guild.id });
        if (!guildData) {
            guildData = new client.db.PluginsData({ guildId: message.guild.id });
            await data.save().catch(error =>
                logger.error("Erreur lors de la sauvegarde des données :", error)
            );
        }
        // MEMBER
        const query = {
            guildId: message.guild.id,
            userId: message.author.id,
        };
        const member = message.guild.members.cache.get(message.author.id);


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

        if (guildData.plugins.levels.enabled) {
            await levelXp.updateXp(member, data, guildData, "msg");
        }

        data.messagesSend = (data.messagesSend || 0) + 1;
        const chance = Math.random();
        if (chance <= 0.25) {
            const reward = 1; // Valeur de la pièce
            data.StreamCurrency = (data.StreamCurrency || 0) + reward;
        }

        if (!Achdata.achievements.messages.level1.achieved && data.messagesSend >= Achdata.achievements.messages.level1.progress.total) {
            Achdata.achievements.messages.level1.achieved = true;
            data.currency += Achdata.achievements.messages.level1.reward;
            Achdata.markModified("achievements.messages.level1")
            await Achdata.save();
            const attachment = new AttachmentBuilder("./assets/img/achievements/achievement_unlocked2_1.png", { name: "unlocked.png" });
            const embed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle(`\`🏆 Succès                        \``)
                .setFooter({ text: `Vous venez de gagner ${Achdata.achievements.messages.level1.reward} coins.` })
                .setImage("attachment://unlocked.png")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const channel = message.guild.channels.cache.get(guildData.plugins.levels.channel);
            if (channel) {
                channel.send({ content: `${message.author}`, embeds: [embed], files: [attachment] });
            } else {
                member.send({ embeds: [embed], files: [attachment], }).catch(() => { });
            }
        } else if (!Achdata.achievements.messages.level2.achieved && data.messagesSend >= Achdata.achievements.messages.level2.progress.total) {
            Achdata.achievements.messages.level2.achieved = true;
            data.currency += Achdata.achievements.messages.level2.reward;
            Achdata.markModified("achievements.messages.level2")
            await Achdata.save();
            const attachment = new AttachmentBuilder("./assets/img/achievements/achievement_unlocked2_2.png", { name: "unlocked.png" });
            const embed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle(`\`🏆 Succès                        \``)
                .setFooter({ text: `Vous venez de gagner ${Achdata.achievements.messages.level2.reward} coins.` })
                .setImage("attachment://unlocked.png")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const channel = message.guild.channels.cache.get(guildData.plugins.levels.channel);
            if (channel) {
                channel.send({ content: `${message.author}`, embeds: [embed], files: [attachment] });
            } else {
                member.send({ embeds: [embed], files: [attachment], }).catch(() => { });
            }
        } else if (!Achdata.achievements.messages.level3.achieved && data.messagesSend >= Achdata.achievements.messages.level3.progress.total) {
            Achdata.achievements.messages.level3.achieved = true;
            data.currency += Achdata.achievements.messages.level3.reward;
            Achdata.markModified("achievements.messages.level3")
            await Achdata.save();
            const attachment = new AttachmentBuilder("./assets/img/achievements/achievement_unlocked2_3.png", { name: "unlocked.png" });
            const embed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle(`\`🏆 Succès                        \``)
                .setFooter({ text: `Vous venez de gagner ${Achdata.achievements.messages.level3.reward} coins.` })
                .setImage("attachment://unlocked.png")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const channel = message.guild.channels.cache.get(guildData.plugins.levels.channel);
            if (channel) {
                channel.send({ content: `${message.author}`, embeds: [embed], files: [attachment] });
            } else {
                member.send({ embeds: [embed], files: [attachment], }).catch(() => { });
            }
        }

        await data.save().catch(error =>
            logger.error("Erreur lors de la sauvegarde des données de membre :", error)
        );
    }
}

module.exports = MessageCreate;
