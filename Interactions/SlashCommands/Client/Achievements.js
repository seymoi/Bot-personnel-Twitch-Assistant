const Command = require("../../../Structures/Classes/BaseCommand");
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    PermissionsBitField,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonStyle,
    ButtonBuilder,
    Colors,
    Collection
} = require("discord.js");
const { t } = require("i18next");
const { progressBar, msToHMS } = require("../../../Structures/Functions/index");
const createBar = require("../../../Structures/Functions/createBar");
const { AchievementsData } = require("../../../Schemas");

class Achievements extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("achievements")
                .setDescription("Affiche vos ou les succès d'un membre")
                .setDMPermission(false)
                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription('Le membre')
                        .setRequired(false)),

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
        const target = interaction.options.getUser('target');
        if (target && target.bot) {
            return interaction.reply({ content: "Cette commande n'est pas utilisable sur les 🤖 bots!", ephemeral: true });
        }
        const query = {
            guildId: interaction.guild.id,
            userId: target ? target.id : interaction.user.id,
        };
        let Achdata = await client.db.AchievementsData.findOne(query);
        if (!Achdata) {
            Achdata = new client.db.Achdata(query)
            await Achdata.save();
        }

        let data = await client.db.MemberDatas.findOne(query);
        if (!data) {
            data = new client.db.MemberDatas(query)
            await data.save();
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setTitle(target ? `\`🏆 Succès remportés par ${target.username}                        \`` : `\`🏆 Succès remportés                        \``)
            .setAuthor({ name: target ? target.username : interaction.user.username, iconURL: target ? target.displayAvatarURL({ dynamic: true }) : interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .addFields(
                {
                    name: `\`Vous avez tapé votre première commande:\``,
                    value: `*${Achdata.achievements.command.progress.now}/${Achdata.achievements.command.progress.total}*`,
                    inline: true,
                },
                {
                    name: `\`Messages envoyés:\``,
                    value: `
                    **Level 1 ${Achdata.achievements.messages.level1.achieved ? "✅" : ""}:** *${data.messagesSend}/${Achdata.achievements.messages.level1.progress.total}*
                    **Level 2 ${Achdata.achievements.messages.level2.achieved ? "✅" : ""}:** *${data.messagesSend}/${Achdata.achievements.messages.level2.progress.total}*
                    **Level 3 ${Achdata.achievements.messages.level3.achieved ? "✅" : ""}:** *${data.messagesSend}/${Achdata.achievements.messages.level3.progress.total}*
                    `,
                    inline: false,
                },
                {
                    name: `\`Temps de vocal:\``,
                    value: `
                    **Level 1 ${Achdata.achievements.vocal.level1.achieved ? "✅" : ""}:** *${msToHMS(data.timeInVocal)}/${msToHMS(Achdata.achievements.vocal.level1.progress.total)}*
                    **Level 2 ${Achdata.achievements.vocal.level2.achieved ? "✅" : ""}:** *${msToHMS(data.timeInVocal)}/${msToHMS(Achdata.achievements.vocal.level2.progress.total)}*
                   **Level 3 ${Achdata.achievements.vocal.level3.achieved ? "✅" : ""}:** *${msToHMS(data.timeInVocal)}/${msToHMS(Achdata.achievements.vocal.level3.progress.total)}*
                    `,
                    inline: false,
                },
            );

        await interaction.reply({ embeds: [embed] })
    }
}

module.exports = Achievements;
