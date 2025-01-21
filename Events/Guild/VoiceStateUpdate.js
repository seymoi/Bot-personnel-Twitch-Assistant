const Event = require("../../Structures/Classes/BaseEvent");
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
const { LevelXp, msToHMS, Logger } = require("../../Structures/Functions/index");
const levelXp = new LevelXp();
const moment = require('moment');
moment.locale('fr');

const logger = new Logger();
const users = new Map();

class VoiceStateUpdate extends Event {
    constructor(client) {
        super(client, {
            name: Events.VoiceStateUpdate,
        });
    }

    async execute(oldState, newState) {
        const { client } = this;

        const member = oldState.member || newState.member;
        const guild = oldState.guild || newState.guild;

        if (!member || member.user.bot) return;

        let guildData = await client.db.PluginsData.findOne({ guildId: guild.id });
        if (!guildData) {
            guildData = new client.db.PluginsData({ guildId: guild.id });
            await guildData.save();
        }
        const query = {
            guildId: guild.id,
            userId: member.id,
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
                console.error("Erreur lors de la sauvegarde des données :", error)
            );
        }

        if (!newState.channel && oldState.channel) {

            // User left the voice channel
            const joinedTimestamp = users.get(member.id); // Get the saved timestamp of when the user joined the voice channel
            if (!joinedTimestamp) return; // In case the bot restarted and the user left the voice channel after the restart (the Map will reset after a restart)
            const totalTime = new Date().getTime() - joinedTimestamp; // The total time the user has been i the voice channel in ms
            data.timeInVocal += totalTime;
            
            if (!Achdata.achievements.vocal.level1.achieved && data.timeInVocal >= Achdata.achievements.vocal.level1.progress.total) {
                Achdata.achievements.vocal.level1.achieved = true;
                data.currency += Achdata.achievements.vocal.level1.reward;
                Achdata.markModified("achievements.vocal.level1")
                await Achdata.save();
                const attachment = new AttachmentBuilder("./assets/img/achievements/achievement_unlocked3_1.png", { name: "unlocked.png" });
                const embed = new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle(`\`🏆 Succès                        \``)
                    .setFooter({ text: `Vous venez de gagner ${Achdata.achievements.vocal.level1.reward} coins.` })
                    .setImage("attachment://unlocked.png")
                    .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                const channel = guild.channels.cache.get(guildData.plugins.levels.channel);
                if (channel) {
                    channel.send({ content: `${member}`, embeds: [embed], files: [attachment] });
                } else {
                    member.send({ embeds: [embed], files: [attachment], }).catch(() => { });
                }
            } else if (!Achdata.achievements.vocal.level2.achieved && data.timeInVocal >= Achdata.achievements.vocal.level2.progress.total) {
                Achdata.achievements.vocal.level2.achieved = true;
                data.currency += Achdata.achievements.vocal.level2.reward;
                Achdata.markModified("achievements.vocal.level2")
                await Achdata.save();
                const attachment = new AttachmentBuilder("./assets/img/achievements/achievement_unlocked3_2.png", { name: "unlocked.png" });
                const embed = new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle(`\`🏆 Succès                        \``)
                    .setFooter({ text: `Vous venez de gagner ${Achdata.achievements.vocal.level2.reward} coins.` })
                    .setImage("attachment://unlocked.png")
                    .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                const channel = guild.channels.cache.get(guildData.plugins.levels.channel);
                if (channel) {
                    channel.send({ content: `${member}`, embeds: [embed], files: [attachment] });
                } else {
                    member.send({ embeds: [embed], files: [attachment], }).catch(() => { });
                }
            } else if (!Achdata.achievements.vocal.level3.achieved && data.timeInVocal >= Achdata.achievements.vocal.level3.progress.total) {
                Achdata.achievements.vocal.level3.achieved = true;
                data.currency += Achdata.achievements.vocal.level3.reward;
                Achdata.markModified("achievements.vocal.level3")
                await Achdata.save();
                const attachment = new AttachmentBuilder("./assets/img/achievements/achievement_unlocked3_3.png", { name: "unlocked.png" });
                const embed = new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle(`\`🏆 Succès                        \``)
                    .setFooter({ text: `Vous venez de gagner ${Achdata.achievements.vocal.level3.reward} coins.` })
                    .setImage("attachment://unlocked.png")
                    .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                const channel = guild.channels.cache.get(guildData.plugins.levels.channel);
                if (channel) {
                    channel.send({ content: `${member}`, embeds: [embed], files: [attachment] });
                } else {
                    member.send({ embeds: [embed], files: [attachment], }).catch(() => { });
                }
            }


            const minutes = Math.floor(totalTime / 60000); // Convertit le temps en minutes
            if (minutes < 1) {
                return;
            } else {
                for (let i = 0; i < minutes; i++) {
                    const chance = Math.random();
                    if (chance <= 0.15) {
                        const reward = 1; // Valeur de la pièce
                        data.StreamCurrency = (data.StreamCurrency || 0) + reward;
                    }
                }
            }


            await data.save().catch(error =>
                logger.error("Erreur lors de la sauvegarde des données de membre :", error)
            );
            if (guildData.plugins.levels.enabled) {
                await levelXp.updateXp(member, data, guildData, totalTime, "voc");
            }
        } else if (oldState.channel === null || oldState.channel && !newState.channel) {

            // User joined the voice channel
            users.set(member.id, new Date().getTime()); // Save the timestamp of when the user joined the voice channel

        }
    }
}

module.exports = VoiceStateUpdate;
