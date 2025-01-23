const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const { t } = require("i18next");
const { Logger } = require("../../../Structures/Functions/Logger");
const logger = new Logger();
const { SteamInfo } = require("../../../Structures/Functions/index");

class BuyKey extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("buy-key")
                .setDescription("Permets d'acheter une clé de jeu aléatoire.")
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
        const keyPrice = 1000; // Coût de la clé

        await interaction.deferReply();

        const query = {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
        };
        let data = await client.db.MemberDatas.findOne(query);
        if (!data) {
            data = new client.db.MemberDatas(query)
            await data.save();
        }

        const userCurrency = data.StreamCurrency || 0; // Anti-crash

        if (userCurrency < keyPrice) {
            return interaction.editReply(
                `❌ Vous n'avez pas assez de monnaie pour acheter une clé. Il vous faut **${keyPrice}** crédits.`
            );
        }

        const availableKeys = await client.db.GameKeys.find({ isSold: false });

        if (availableKeys.length === 0) {
            return interaction.editReply("❌ Aucune clé n'est disponible pour le moment.");
        }

        const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        randomKey.isSold = true;
        await randomKey.save();

        const keysSold = await client.db.GameKeys.find({ isSold: true });

        data.StreamCurrency = userCurrency - keyPrice;
        await data.save();
        logger.info(`🔑 ${interaction.user.username} vient d'acheter une clé: ${randomKey.key}.`)

        const gameInfo = await SteamInfo(randomKey.gameName);

        const steamEmbed = new EmbedBuilder()
            .setTitle(`\`ℹ️ Informations de ${randomKey.gameName}                        \``)
            .setThumbnail(gameInfo.image)
            .setColor(Colors.Yellow)
            .setDescription(`${gameInfo.description}`)
            .addFields(
                { name: "\`Développeurs\`", value: `*${gameInfo.developers}*`, inline: true },
                { name: "\`Editeurs\`", value: `*${gameInfo.publishers}*`, inline: true },
                { name: "\`Prix\`", value: `*${gameInfo.price}*`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `Il est possible que les informations ne soit pas exactes.` });

        const embed = new EmbedBuilder()
            .setTitle(`\`🗝️ Clé obtenue                        \``)
            .setColor(Colors.Green)
            .setDescription(`Votre clé pour **${randomKey.gameName}** vient de t'être envoyée en dm!\n\n*Rien dans tes dm ? @SEY*`)
            .setFooter({ text: `Déjà ${keysSold.length} offertes!` });

        await interaction.user.send({ content: `Voici votre clé **${randomKey.gameName}** :\n\`\`\`${randomKey.key}\`\`\`` }).catch(() => { })
        await interaction.editReply({ embeds: [embed, gameInfo ? steamEmbed : ""] });
    }
}

module.exports = BuyKey;
