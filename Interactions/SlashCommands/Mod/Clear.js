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
class Clear extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("clear")
                .setDescription("Supprime des messages en masse.")
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
                .setDMPermission(false)
                .addIntegerOption(option =>
                    option.setName('nombre')
                        .setDescription('Le nombre de message à supprimer. (1-99)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(99)
                )
                .addUserOption(option =>
                    option.setName("utilisateur")
                        .setDescription("Uniquement les messages de cet utilisateur.")
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
        let num = interaction.options.getInteger('nombre');
        const user = interaction.options.getUser('utilisateur');

        let messages = await interaction.channel.messages.fetch({ limit: 100 });

        if (user) {
            messages = messages.filter((m) => m.author.id === user.id);
        }
        if (messages.length > num) {
            messages.length = parseInt(num, 10);
        }
        messages = messages.filter((m) => !m.pinned);
        num++;

        interaction.channel.bulkDelete(messages, true);


        if (user) {
            await interaction.reply({ content: `${--num} messages de ${user.username} viennent d'être supprimés.` })
        } else {
            await interaction.reply({ content: `${--num} messages viennent d'être supprimés.` })

        }

    }
}


module.exports = Clear;
