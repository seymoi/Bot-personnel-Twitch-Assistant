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
    Colors
} = require("discord.js");
const { t } = require("i18next");

class addMoney extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName('add-money')
                .setDescription("Ajouter de la monnaie à un utilisateur.")
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription("Utilisateur à créditer.")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription("Montant à ajouter.")
                        .setRequired(true)
                        .setMinValue(1))
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("Type de monnaie")
                        .setRequired(true)
                        .addChoices(
                            { name: "Stream", value: "stream" },
                            { name: "Classique", value: "classic" },
                        )
                ),

            options: {
        
                devOnly: true,
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
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const query = {
            guildId: interaction.guild.id,
            userId: targetUser.id,
        };
        let data = await client.db.MemberDatas.findOne(query);
        if (!data) {
            data = new client.db.MemberDatas(query)
            await data.save();
        }
        switch (type) {
            case "stream": {
                data.StreamCurrency = (data.StreamCurrency || 0) + amount; // Anti-crash
                break;
            }
            case "classic": {
                data.currency = (data.currency || 0) + amount; // Anti-crash
                break;
            }
        }


        await data.save();

        await interaction.reply(`💰 **${amount}** crédits (||${type}||) ont été ajoutés à ${targetUser.username}.`);

    }
}

module.exports = addMoney;
