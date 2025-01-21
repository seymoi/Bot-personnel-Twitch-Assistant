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

class RoleAll extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("roleall")
                .setDescription("Donne un role a tout le monde.")
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
                .addRoleOption(option =>
                    option.setName("role")
                        .setDescription("Le role a donner a tout le monde")
                        .setRequired(true)
                ),
        });
    }
    /**
     *
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     * @param {import("../../../Structures/Classes/BotClient").BotClient} client
     * @param {string} lng
     */
    async execute(interaction, client, lng) {
        const members = await interaction.guild.members.fetch();
        const role = interaction.options.getRole("role");

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return await interaction.reply({ content: "Vous n'avez pas les permissions nécessaires.", ephemeral: true });
        else {
            await interaction.reply({ content: `Rôle *${role.name}* en cours de donation...` });

            let num = 0;
            setTimeout(() => {
                members.forEach(async m => {
                    m.roles.add(role).catch(err => {
                        return;
                    });
                    num++;

                    const embed = new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setDescription(`\`${num}\` membres ont eu le role ${role.name}.`)

                    await interaction.editReply({ content: "", embeds: [embed] });
                })
            }, 100)
        }
    }
}

module.exports = RoleAll;
