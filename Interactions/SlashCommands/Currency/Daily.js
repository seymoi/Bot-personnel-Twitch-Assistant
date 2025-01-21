const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");

const { progressBar, msToHMS } = require("../../../Structures/Functions/index");


class Daily extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("daily")
                .setDescription("Récupère ta récompense quotidienne.")
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
        const query = {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
        };
        let data = await client.db.MemberDatas.findOne(query);
        if (!data) {
            data = new client.db.MemberDatas(query)
            await data.save();
        }

        const now = new Date();
        const lastDaily = data.daily ? new Date(data.daily) : null;

        if (lastDaily && now - lastDaily < 86400000) { // 86400000 ms = 24 heures
            const remainingTime = 86400000 - (now - lastDaily);
            return await interaction.reply({ content: `❌ Vous avez déjà récupéré votre récompense quotidienne ! Revenez dans **${msToHMS(remainingTime)}**.`, ephemeral: true });
        }

        const level = data.level || 0;
        const dailyReward = Math.min(10 + (level - 1) * 2, 50); // Plafonné à 50 crédits

        data.StreamCurrency = (data.StreamCurrency || 0) + dailyReward;
        data.currency = (data.currency || 0) + 1000
        data.daily = now;
        await data.save();

        const embed = new EmbedBuilder()
            .setColor(Colors.NotQuiteBlack)
            .setTitle(`\`🗞️ Récompense quotidienne                        \``)
            .setDescription(`🪙 \`+1000 (${data.currency})\` coins.\n<:currency:1319403790281080843> \`+${dailyReward} (${data.StreamCurrency})\` stream coins.`)
            .setFooter({ text: `Revenez demain pour votre prochaine récompense.` })
            .setTimestamp()

        await interaction.reply({ embeds: [embed] })
    }
}

module.exports = Daily;
