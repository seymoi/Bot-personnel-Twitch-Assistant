const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const { t } = require("i18next");
const { Logger } = require("../../../Structures/Functions/Logger");
const logger = new Logger();

class Stock extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("stock")
                .setDescription("Afficher le stock de clés disponibles.")
                .setDMPermission(false),
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
        const availableKeys = await client.db.GameKeys.find({ isSold: false });
        const keysSold = await client.db.GameKeys.find({ isSold: true });

        if (availableKeys.length === 0) {
            return await interaction.reply("Aucune clé n'est disponible en ce moment.");
        }

        // Compte les clés disponibles par jeu
        const stock = availableKeys.reduce((acc, key) => {
            acc[key.gameName] = (acc[key.gameName] || 0) + 1;
            return acc;
        }, {});

        // Transforme le stock en un tableau pour le rendre manipulable
        const stockArray = Object.entries(stock);

        // Mélange les jeux et sélectionne 10 jeux aléatoirement
        const shuffledStock = stockArray.sort(() => Math.random() - 0.5);
        const randomStock = shuffledStock.slice(0, 10); // Limite à 10 jeux

        // Construction de la description
        const description = randomStock
            .map(([game, count]) => `||${game}||`)
            .join(", ");

        const embed = new EmbedBuilder()
            .setTitle(`\`📦 Stock de clés                        \``)
            .setColor(Colors.Yellow)
            .setDescription(`Il y a actuellement **${availableKeys.length} clé(s)** disponibles dans la boutique. \n\n*Toutes les clés dans la boutique sont achetées par lot. Je ne peux donc pas vérifier si elles fonctionnent.*`)
            .addFields(
                {
                    name: "Vous pouvez y retrouver",
                    value: description
                }
            )
            .setFooter({ text: `Déjà ${keysSold.length} clés offertes.` });

        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = Stock;
