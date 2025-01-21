const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");

const { progressBar, msToHMS } = require("../../../Structures/Functions/index");


class Level extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("level")
                .setDescription("Affiche votre level ou celui du membre.")
                .setDMPermission(false)
                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription('The member to see')
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
        const target = interaction.options.getUser('target');
        if (target && target.bot) {
            return interaction.reply({ content: "Cette commande n'est pas utilisable sur les 🤖 bots!", ephemeral: true });
        }
        const query = {
            guildId: interaction.guild.id,
            userId: target ? target.id : interaction.user.id,
        };
        let data = await client.db.MemberDatas.findOne(query);
        if (!data) {
            data = new client.db.MemberDatas(query)
            await data.save();
        }

        const xp = parseInt(data.xp || 0, 10);
        const level = parseInt(data.level || 0, 10);
        const neededXp = 5 * (level * level) + 80 * level + 100;

        const embed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setThumbnail(target ?
                target.displayAvatarURL({ dynamic: true }) :
                interaction.user.displayAvatarURL({ dynamic: true })
            )
            .setTitle(`${target ?
                `\`${target.username} est level: ${level}                         \``
                : `\`Level: ${level}                         \``}
                 `)
            .addFields(
                {
                    name: "⠀",
                    value:
                        target ? `${target.username} à envoyé *\`${data.messagesSend}\`* messages et est resté *\`${msToHMS(data.timeInVocal)}\`* en vocal.` : `Vous avez envoyé *\`${data.messagesSend}\`* messages et vous êtes resté *\`${msToHMS(data.timeInVocal)}\`* en vocal.`,
                }
            )
            .setDescription(`${await progressBar(xp, neededXp, "10")}\n*${xp}/${neededXp} (${data.msgXp + data.vocXp}) points d'expérience*`)
            .setTimestamp()

        await interaction.reply({ embeds: [embed] })
    }
}

module.exports = Level;
