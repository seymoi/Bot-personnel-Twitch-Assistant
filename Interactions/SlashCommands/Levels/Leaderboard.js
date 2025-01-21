const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");

const { progressBar, msToHMS } = require("../../../Structures/Functions/index");


class Leaderboard extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("leaderboard")
                .setDescription("Affiche un classement.")
                .setDMPermission(false)
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("Type de classement")
                        .setRequired(false)
                        .addChoices(
                            { name: "Messages envoyés", value: "msg" },
                            { name: "Temps en vocal", value: "voc" },
                            { name: "Monnaies", value: "currency" },
                            { name: "Niveaux gagnés", value: "lvl" },
                            { name: "Serveur (score total)", value: "global" }
                        )
                ),
            options: {
    
                //  devOnly: false,
            },
        });
    }
    /**
     *
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     * @param {import("../../../Structures/Classes/BotClient").BotClient} client
     * @param {string} lng
     */
    async execute(interaction, client, lng) {
        const type = interaction.options.getString('type');
        const guildId = interaction.guild.id;
        let data = await client.db.MemberDatas.find({ guildId });
        if (!data) {
            return await interaction.reply({ content: "Aucune données trouvées pour ce serveur", ephemeral: true })
        }
        switch (type) {
            case "global": {
                const scores = data.map(member => ({
                    userId: member.userId,
                    totalScore:
                        (member.messagesSend || 0) +
                        (member.timeInVocal || 0) / 1000 +
                        (member.level || 0) * 1000,
                }));

                const sortedScores = scores.sort((a, b) => b.totalScore - a.totalScore);


                const top3 = sortedScores.slice(0, 3);

                const userIndex = sortedScores.findIndex(member => member.userId === interaction.user.id);
                const userRank = userIndex !== -1 ? userIndex + 1 : null;
                const userData = userIndex !== -1 ? sortedScores[userIndex] : null;

                let description = top3
                    .map((member, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
                        return `**${medal} ${index + 1}.** <@${member.userId}> - **Score global : \`${Math.round(member.totalScore)}\`**`;
                    })
                    .join("\n");

                if (userRank && userRank > 3) {
                    description += `\n...**${userRank}.** <@${interaction.user.id}> - **Score global : \`${Math.round(userData.totalScore)}\`**`;
                }


                const embed = new EmbedBuilder()
                    .setTitle(`\`🌟 Podium                        \``)
                    .setColor(Colors.Gold)
                    .setDescription(description || "Aucun membre dans cette catégorie pour le moment.")
                    .setFooter({ text: "Classement basé sur les données totales (messages, vocal, niveau)." })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "msg": {
                const topMessages = [...data]
                    .filter(member => member.messagesSend > 0)
                    .sort((a, b) => b.messagesSend - a.messagesSend);

                const top10 = topMessages.slice(0, 10);

                const userIndex = topMessages.findIndex(member => member.userId === interaction.user.id);
                const userRank = userIndex !== -1 ? userIndex + 1 : null;
                const userData = userIndex !== -1 ? topMessages[userIndex] : null;

                let leaderboardDescription = top10
                    .map((member, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                        return `**${medal}.** <@${member.userId}> - \`${member.messagesSend} message(s)\``;
                    })
                    .join("\n");

                if (userRank && userRank > 10) {
                    leaderboardDescription += `\n...**${userRank}.** <@${interaction.user.id}> - \`${userData.messagesSend} message(s)\``;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`\`📋 Classement: 🖊️Messages envoyés                        \``)
                    .setColor(Colors.Yellow)
                    .setDescription(leaderboardDescription || "Aucun membre dans cette catégorie.")
                    .setTimestamp()
                await interaction.reply({ embeds: [embed] })
                break;
            }
            case "voc": {
                const topVoice = [...data]
                    .filter(member => member.timeInVocal > 0)
                    .sort((a, b) => b.timeInVocal - a.timeInVocal);

                const top10 = topVoice.slice(0, 10);

                const userIndex = topVoice.findIndex(member => member.userId === interaction.user.id);
                const userRank = userIndex !== -1 ? userIndex + 1 : null;
                const userData = userIndex !== -1 ? topVoice[userIndex] : null;

                let leaderboardDescription = top10
                    .map((member, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                        return `**${medal}.** <@${member.userId}> - **\`${msToHMS(member.timeInVocal)}\`**`
                    }
                    )
                    .join("\n");

                if (userRank && userRank > 10) {
                    leaderboardDescription += `\n...**${userRank}.** <@${interaction.user.id}> - **\`${msToHMS(userData.timeInVocal)}\`**`;
                }

                const embed = new EmbedBuilder()
                    .setTitle(`\`📋 Classement: 🔊Vocal                        \``)
                    .setColor(Colors.Yellow)
                    .setDescription(leaderboardDescription || "Aucun membre dans cette catégorie.")
                    .setTimestamp()
                await interaction.reply({ embeds: [embed] })
                break;
            }
            case "lvl": {
                const topLevel = [...data]
                    .filter(member => member.level > 0)
                    .sort((a, b) => b.level - a.level);


                const top10 = topLevel.slice(0, 10);

                const userIndex = topLevel.findIndex(member => member.userId === interaction.user.id);
                const userRank = userIndex !== -1 ? userIndex + 1 : null;
                const userData = userIndex !== -1 ? topLevel[userIndex] : null;

                let leaderboardDescription = top10
                    .map((member, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                        return `**${medal}.** <@${member.userId}> - **\`Niveau ${member.level}\`**`
                    }
                    )
                    .join("\n");

                if (userRank && userRank > 10) {
                    leaderboardDescription += `\n...**${userRank}.** <@${interaction.user.id}> - **\`Niveau ${userData.level}\`**`;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`\`📋 Classement: ⭐Level                        \``)
                    .setColor(Colors.Yellow)
                    .setDescription(leaderboardDescription || "Aucun membre dans cette catégorie pour le moment.")
                    .setTimestamp()
                await interaction.reply({ embeds: [embed] })
                break;
            }
            case "currency": {
                const topCurrency = [...data]
                    .filter(member => member.currency > 0)
                    .sort((a, b) => b.currency - a.currency);


                const top101 = topCurrency.slice(0, 10);

                const userIndex1 = topCurrency.findIndex(member => member.userId === interaction.user.id);
                const userRank1 = userIndex1 !== -1 ? userIndex1 + 1 : null;
                const userData1 = userIndex1 !== -1 ? topCurrency[userIndex1] : null;

                let leaderboardDescription1 = top101
                    .map((member, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                        return `**${medal}.** <@${member.userId}> - **\`${member.currency} \`🪙**`
                    }
                    )
                    .join("\n");

                if (userRank1 && userRank1 > 10) {
                    leaderboardDescription1 += `\n...**${userRank1}.** <@${interaction.user.id}> - **\`${userData1.currency} \`🪙**`;
                }

                const topStreamCurrency = [...data]
                    .filter(member => member.StreamCurrency > 0)
                    .sort((a, b) => b.StreamCurrency - a.StreamCurrency);

                const top102 = topStreamCurrency.slice(0, 10);

                const userIndex2 = topStreamCurrency.findIndex(member => member.userId === interaction.user.id);
                const userRank2 = userIndex2 !== -1 ? userIndex2 + 1 : null;
                const userData2 = userIndex2 !== -1 ? topStreamCurrency[userIndex2] : null;

                let leaderboardDescription2 = top102
                    .map((member, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                        return `**${medal}.** <@${member.userId}> - **\`${member.StreamCurrency} \`<:currency:1319403790281080843>**`
                    }
                    )
                    .join("\n");

                if (userRank2 && userRank2 > 10) {
                    leaderboardDescription2 += `\n...**${userRank2}.** <@${interaction.user.id}> - **\`${userData2.StreamCurrency}\` <:currency:1319403790281080843>**`;
                }

                const embed = new EmbedBuilder()
                    .setTitle(`\`📋 Classement: Monnaies                        \``)
                    .setColor(Colors.Yellow)
                    .addFields(
                        {
                            name: "Stream Coins",
                            value: leaderboardDescription2 || "Aucun membre dans cette catégorie.",
                            inline: true
                        },
                        {
                            name: "Coins",
                            value: leaderboardDescription1 || "Aucun membre dans cette catégorie.",
                            inline: true,
                        }
                    )
                    .setTimestamp()
                await interaction.reply({ embeds: [embed] })
                break;
            }
            default: {

                const generateCategoryLeaderboard = (title, filterKey, displayFormatter) => {
                    const categoryData = [...data]
                        .filter(member => member[filterKey] > 0)
                        .sort((a, b) => b[filterKey] - a[filterKey]);

                    const top3 = categoryData.slice(0, 3);
                    const userIndex = categoryData.findIndex(member => member.userId === interaction.user.id);
                    const userRank = userIndex !== -1 ? userIndex + 1 : null;
                    const userData = userIndex !== -1 ? categoryData[userIndex] : null;

                    let description = top3
                        .map((member, index) => {
                            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                            return `**${medal}.** <@${member.userId}> - ${displayFormatter(member)}`
                        })
                        .join("\n");

                    if (userRank && userRank > 3) {
                        description += `\n...**${userRank}.** <@${interaction.user.id}> - ${displayFormatter(userData)}`;
                    }

                    return {
                        name: title,
                        value: description || "Aucun membre dans cette catégorie.",
                        inline: false,
                    };
                };

                // Création des sections pour chaque catégorie
                const embedFields = [
                    generateCategoryLeaderboard(
                        "Messages envoyés",
                        "messagesSend",
                        member => `**\`${member.messagesSend} message(s)\`**`
                    ),
                    generateCategoryLeaderboard(
                        "Temps en vocal",
                        "timeInVocal",
                        member => `**\`${msToHMS(member.timeInVocal)}\`**`
                    ),
                    generateCategoryLeaderboard(
                        "Niveaux",
                        "level",
                        member => `**\`Niveau ${member.level}\`**`
                    ),
                    generateCategoryLeaderboard(
                        "Coins",
                        "currency",
                        member => `**\`${member.currency}\` 🪙**`
                    ),
                    generateCategoryLeaderboard(
                        "Stream Coins",
                        "StreamCurrency",
                        member => `**\`${member.StreamCurrency}\` <:currency:1319403790281080843>**`
                    ),
                ];

                // Construction de l'embed final
                const embed = new EmbedBuilder()
                    .setTitle(`\`📋 Classement: Général                        \``)
                    .setColor(Colors.Yellow)
                    .addFields(embedFields)
                    .setTimestamp()
                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}

module.exports = Leaderboard;
