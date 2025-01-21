const config = require("../../config");
const xpCooldown = {};
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
const msToHMS = require('./msToHMS');
class LevelXp {
    constructor() { }

    levelUp(xp, data) {
        let leveledUp = false;
        while (true) {
            const neededXp = 5 * (data.level * data.level) + 80 * data.level + 100;

            if (xp >= neededXp) {
                data.level += 1;
                xp -= neededXp;
                leveledUp = true;
            } else {
                break;
            }
        }
        data.xp = xp;
        return leveledUp;
    }

    async updateXp(member, data, guildData, timeInMS, type = "msg") {
        const points = parseInt(data.xp || 0, 10);
        const level = parseInt(data.level || 0, 10);

        switch (type) {
            case "msg": {
                const isInCooldown = xpCooldown[member.id];
                if (isInCooldown && isInCooldown > Date.now()) return;

                xpCooldown[member.id] = Date.now() + 60000;

                const won = Math.floor(Math.random() * (12 - 5 + 1)) + 5; // 5 à 10 XP
                const newXp = points + won ;
                data.msgXp += won;

                if (this.levelUp(newXp, data)) {
                    this.sendLevelUpMessage(member, data, guildData);
                } else {
                    data.xp = newXp;
                }

                await data.save().catch(error =>
                    console.error("Erreur lors de la sauvegarde des données :", error)
                );
                break;
            }
            case "voc": {
                const minutes = Math.floor(timeInMS / 60000); // Convertit le temps en minutes
                if (minutes < 1) return;

                console.log(`[XP] ${member.user.tag} a passé ${minutes} minute(s) actif en vocal.`);

                let totalXp = 0;
                for (let i = 0; i < minutes; i++) {
                    const xp = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
                    totalXp += xp;
                }

                const newXp = points + totalXp;
                data.vocXp += totalXp;

                console.log(`[XP] Total XP gagné en vocal pour ${member.user.tag} : ${totalXp}. XP actuel : ${newXp}.`);


                if (this.levelUp(newXp, data)) {
                    this.sendLevelUpMessage(member, data, guildData);
                    console.log(`[XP] ${member.user.tag} est passé au niveau supérieur ! Niveau actuel : ${data.level}.`);
                } else {
                    data.xp = newXp;
                }

                await data.save().catch(error =>
                    console.error("Erreur lors de la sauvegarde des données :", error)
                );
                break;
            }
        }
    }

    sendLevelUpMessage(member, data, guildData) {
        if (!guildData.plugins.levels.greetings) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setTitle(`\`Level Up !                        \``)
            .setDescription(`⭐ Vous êtes maintenant au niveau **${data.level}**!`)
            .setFooter({ text: `${data.messagesSend} messages | ${msToHMS(data.timeInVocal)} en vocal.` })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        const channel = member.guild.channels.cache.get(guildData.plugins.levels.channel);
        if (channel) {
            channel.send({ content: `${member}`, embeds: [embed] });
        } else {
            member.send({ embeds: [embed] }).catch(() => { });
        }
    }
}

module.exports = { LevelXp };