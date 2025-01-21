const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const { t } = require("i18next");

class Ad extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("ad")
                .setDescription("Envoie une annonce dans un channel")
                .setDMPermission(false)
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription("Le type d'annonce (ex: Monday).")
                        .setRequired(true)
                        .addChoices(
                            { name: 'Partenariat', value: 'partnt' },
                            { name: 'Stream', value: 'stream' },
                            { name: 'Générale', value: 'gen' },

                        )
                )
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription("Le message")
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription("Le salon dans lequel envoyé l'annonce")
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName("mention")
                        .setDescription("Voulez vous utiliser la mention ?")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName('fichier')
                        .setDescription("Une image a ajouter")
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
        const message = interaction.options.getString('message');
        const fichier = interaction.options.getAttachment('fichier');
        const channel = interaction.options.getChannel('channel');
        const type = interaction.options.getString('type');
        const mention = interaction.options.getBoolean('mention');


        const embed = new EmbedBuilder()
            .setTitle(`${formatType(type)}`)
            .setDescription(`\`\`\`asciidoc\n${formatMessage(message)}\n\`\`\``)
            .setColor(Colors.Yellow)
            .setFooter({
                text: "SEY",
                iconURL: "https://static-cdn.jtvnw.net/jtv_user_pictures/64da0269-1225-4919-8685-a25f0cf1c1fc-profile_image-70x70.png"
            })
        if (fichier) {
            await embed.setImage(fichier.url)
        }
        channel.send({ content: `${mention ? "<@&1280104259744043109>" : " "}`, embeds: [embed] })

        interaction.reply(`L'annonce vient d'être envoyée vers ${channel} ✅`)
    }
}

module.exports = Ad;


function formatType(content) {
    return content.replace("partnt", "Annonce Partenariat")
        .replace("stream", "Annonce Stream")
        .replace("gen", "Annonce générale")
};

function formatMessage(message) {
    return message
        .split('→') // Divise la chaîne en lignes à chaque "\n"
        .map(line => `${line.trim()} ::`) // Ajoute ":: " à la fin de chaque ligne
        .join('\n'); // Réassemble avec des retours à la ligne
}