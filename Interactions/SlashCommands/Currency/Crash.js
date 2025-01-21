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
    Collection,
    Colors
} = require("discord.js");
const { progressBar, msToHMS, Logger } = require("../../../Structures/Functions/index");
const logger = new Logger();
const activeGames = new Collection();

class Crash extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("crash")
                .setDescription("🛩️ Faites décoller l'avion et arrêtez-l'avant qu'il ne se crash!")
                .setDMPermission(false)
                .addNumberOption(option =>
                    option.setName('mise')
                        .setDescription("Montant à jouer.")
                        .setRequired(true)
                        .setMinValue(10)
                        .setMaxValue(500)),
            options: {

                //  devOnly: false,
                disabled: true
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

        if (activeGames.has(interaction.user.id)) {
            return await interaction.reply({ content: `Vous avez déjà une partie en cours...`, ephemeral: true })
        }

        activeGames.set(interaction.user.id);

        let money = parseInt(interaction.options.getNumber('mise'));

        const query = {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
        };
        let data = await client.db.MemberDatas.findOne(query);
        if (!data) {
            data = new client.db.MemberDatas(query)
            await data.save();
        }

        await interaction.deferReply();

        if (money > data.currency) {
            activeGames.delete(interaction.user.id);
            return await interaction.editReply({ content: `Vous ne pouvez pas misez plus que ce que vous possèdez. (*Solde: ${data.currency}* coins)`, ephemeral: true });
        }

        var result = Math.ceil(Math.random() * 10);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('crash_stop')
                    .setEmoji("🛑")
                    .setStyle(ButtonStyle.Danger),
            )

        const disableRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('crash_stop')
                    .setEmoji("🛑")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true),
            )

        const embed = new EmbedBuilder()
            .setColor(Colors.NotQuiteBlack)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`L'avion décolle 🛩️. \n*Réagis avec 🛑 pour le stopper.*`)
            .addFields(
                {
                    name: `\u200b`,
                    value: `🛩️ \`1x\``,
                    inline: true,
                },
                {
                    name: `Profit`,
                    value: `**0**`,
                    inline: true,
                }
            )
            .setTimestamp()
        interaction.editReply({ embeds: [embed], components: [row] })
            .then(msg => {
                let multiplier = 1;
                let index = 0;
                let profit = 0
                let times = result + 1;
                let timer = 2000 * times;

                setInterval(async () => {
                    if (index === result + 1) { return }
                    else if (index === result) {

                        data.currency -= money
                        await data.save();

                        const embed4 = new EmbedBuilder()
                            .setColor(Colors.NotQuiteBlack)
                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`Résultat:`)
                            .addFields(
                                {
                                    name: `Crash 💥`,
                                    value: `-**${money}**`,
                                    inline: false,
                                }
                            )
                            .setTimestamp()
                        activeGames.delete(interaction.user.id);
                        return msg.edit({ embeds: [embed4], components: [disableRow] })

                    }
                    else {
                        index += 1;
                        multiplier += 0.2;

                        let calc = money * multiplier;
                        profit = calc - money;

                        const embed1 = new EmbedBuilder()
                            .setColor(Colors.NotQuiteBlack)
                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`L'avion décolle 🛩️. \n*Réagis avec 🛑 pour le stopper.*`)
                            .addFields(
                                {
                                    name: `\u200b`,
                                    value: `🛩️ \`${multiplier.toFixed(1)}x\``,
                                    inline: true,
                                },
                                {
                                    name: `Profit`,
                                    value: `**${profit.toFixed(2)} coins**`,
                                    inline: true,
                                }
                            )
                            .setTimestamp()
                        activeGames.delete(interaction.user.id);
                        msg.edit({ embeds: [embed1], components: [row] })
                    }
                }, 2000)

                const filter = i => i.user.id === interaction.user.id;
                interaction.channel.awaitMessageComponent({ filter, max: 1, time: timer })
                    .then(async i => {
                        if (i.customId == "crash_stop") {
                            i.deferUpdate();

                            index = result + 1;
                            profit = money * multiplier;

                            data.currency += parseInt(profit)
                            await data.save();

                            const embed2 = new EmbedBuilder()
                                .setColor(Colors.NotQuiteBlack)
                                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`Résultat:`)
                                .addFields(
                                    {
                                        name: `Profit`,
                                        value: `**${profit.toFixed(2)} coins**`,
                                        inline: false,
                                    }
                                )
                                .setTimestamp()
                            activeGames.delete(interaction.user.id);
                            return msg.edit({ embeds: [embed2], components: [disableRow] })

                        }
                    })
                    .catch(async (error) => {
                        index = result + 1;

                        data.currency -= money
                        await data.save();

                        const embed3 = new EmbedBuilder()
                            .setColor(Colors.NotQuiteBlack)
                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`Résultat:`)
                            .addFields(
                                {
                                    name: `Crash 💥`,
                                    value: `-**${money}**`,
                                    inline: false,
                                }
                            )
                            .setTimestamp()
                        activeGames.delete(interaction.user.id);
                        logger.error(`Error: ${error}`)
                        return msg.edit({ embeds: [embed3], components: [disableRow] })

                    })
            })
    }
}

module.exports = Crash;
