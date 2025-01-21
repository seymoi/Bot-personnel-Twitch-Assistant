const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");

class Reverse extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("reverse")
                .setDescription("Ecrit un mot a l'envers")
                .setDMPermission(false)
                .addStringOption(option =>
                    option.setName('mot')
                        .setDescription('Le mot à inverser.')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option.setName("ephemere")
                        .setDescription("Message caché ?")
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
        const mot = interaction.options.getString('mot');
        const eph = interaction.options.getBoolean('ephemere');
        await interaction.reply({ content: `${reverseText(mot ? mot : "Aucun texte ajouté")}`, ephemeral: eph ? eph : false })
    }
}

function reverseText(string) {
    return string.split('').reverse().join('');
}
module.exports = Reverse;
