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

class addKey extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName('add-key')
                .setDescription("Ajouter une clé de jeu dans la boutique.")
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                .addStringOption(option =>
                    option.setName('game')
                        .setDescription("Nom du jeu")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('key')
                        .setDescription("Clé de jeu")
                        .setRequired(true)),
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
        const gameName = interaction.options.getString('game');
        const key = interaction.options.getString('key');

        const existingKey = await client.db.GameKeys.findOne({ key });
        if (existingKey) {
            return await interaction.reply({
                content: "Cette clé existe déjà dans la base de données !",
                ephemeral: true
            });
        }

        // Ajouter la clé dans la base de données
        const newKey = new client.db.GameKeys({ gameName, key });
        await newKey.save();

        await interaction.reply({
            content: `Clé pour **${gameName}** ajoutée avec succès !`,
            ephemeral: true,
        });
    }
}

module.exports = addKey;
