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
class Link extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("link")
                .setDescription("Lie un compte twitch à votre compte discord.")
                .setDMPermission(false)
                .addStringOption(option =>
                    option.setName('chaine')
                        .setDescription('Votre chaine twitch.')
                        .setRequired(true)
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
        const channel = interaction.options.getString('chaine');

        const query = {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
        };
        let data = await client.db.MemberDatas.findOne(query);
        if (!data) {
            data = new client.db.MemberDatas(query)
            await data.save();
        }

        let linked = await client.db.MemberDatas.findOne({ twitchId: channel });
        await interaction.deferReply({ ephemeral: true });

        if (linked && linked.userId !== interaction.user.id) {
            const embed = new EmbedBuilder()
                .setColor(Colors.NotQuiteBlack)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setTitle(`\`📎 Lien Twitch                        \``)
                .setURL(`https://twitch.tv/${channel}`)
                .setDescription(`Le compte Twitch \`${channel}\` est déjà lié avec un autre compte Discord! (<@${linked.userId}>)`)
                .setTimestamp()
            return await interaction.editReply({ embeds: [embed] })
        }
        if (data.twitchId) {
            if (data.twitchId == channel) {
                const embed = new EmbedBuilder()
                    .setColor(Colors.NotQuiteBlack)
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setTitle(`\`📎 Lien Twitch                        \``)
                    .setURL(`https://twitch.tv/${channel}`)
                    .setDescription(`Votre compte Twitch \`${channel}\` est déjà lié avec succès!`)
                    .setTimestamp()
                return await interaction.editReply({ embeds: [embed] })
            }
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('modify')
                        .setLabel('Modifier')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('Annuler')
                        .setStyle(ButtonStyle.Danger)
                )
            await interaction.editReply({ content: `Vous avez déjà un compte Twitch lié: \`${data.twitchId}\`. Souhaitez vous le modifier ?`, components: [row], ephemeral: true });

            const filter = i => i.user.id === interaction.user.id;
            await interaction.channel.awaitMessageComponent({ filter, time: 15000 })
                .then(async i => {
                    const createEmbed = (description) => {
                        return new EmbedBuilder()
                            .setColor(Colors.NotQuiteBlack)
                            .setThumbnail(i.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('`📎 Lien Twitch`')
                            .setURL(`https://twitch.tv/${channel}`)
                            .setDescription(description)
                            .setTimestamp();
                    };

                    try {
                        if (i.customId === "modify") {
                            data.twitchId = channel;
                            await data.save();
                            const embed = createEmbed(`Votre compte Twitch \`${channel}\` a été lié avec succès!`);
                            await i.reply({ embeds: [embed], ephemeral: true });
                        } else if (i.customId === "cancel") {
                            const embed = createEmbed(`Votre compte Twitch \`${channel}\` reste inchangé!`);
                            await i.reply({ embeds: [embed], ephemeral: true });
                        }
                    } catch (error) {
                        console.error(error);
                    }
                })
                .catch(error => {
                    console.error(error);
                    interaction.editReply({ content: `Temps de réponse dépassé.` });
                });
            return;
        }

        data.twitchId = channel;
        await data.save();

        const embed = new EmbedBuilder()
            .setColor(Colors.NotQuiteBlack)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setTitle(`\`📎 Lien Twitch                        \``)
            .setURL(`https://twitch.tv/${channel}`)
            .setDescription(`Votre compte Twitch \`${channel}\` a été lié avec succès!`)
            .setTimestamp()
        await interaction.editReply({ embeds: [embed] })
    }
}

module.exports = Link;
