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
    ButtonStyle,
    ButtonBuilder,
    Collection,
    Colors
} = require("discord.js");
const { progressBar, msToHMS } = require("../../../Structures/Functions/index");
const activeGames = new Collection();

class Slots extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("slots")
                .setDescription("🎰 Mettez vos coins en jeu en jouant au mâchine à sous.")
                .setDMPermission(false)
                .addNumberOption(option =>
                    option.setName('mise')
                        .setDescription("Montant à jouer.")
                        .setRequired(true)
                        .setMinValue(1)),
            options: {
  
                //  devOnly: false,
                disabled: false,
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
        let mise = Math.floor(interaction.options.getNumber('mise'));
        let money = mise;
        let win = false;

        if (activeGames.has(interaction.user.id)) {
            return await interaction.reply({ content: `Vous avez déjà une partie en cours...`, ephemeral: true })
        }

        activeGames.set(interaction.user.id);

        const query = {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
        };
        let data = await client.db.MemberDatas.findOne(query);
        if (!data) {
            data = new client.db.MemberDatas(query);
            await data.save();
        }

        await interaction.deferReply();

        if (money > data.currency) {
            return await interaction.editReply({
                content: `❌ Vous ne pouvez pas miser plus que ce que vous possédez. (*Solde: ${data.currency} coins*)`,
                ephemeral: true,
            });
        }

        // Configuration des symboles (pond\u00e9ration ajust\u00e9e et ajout de "blancs")
        const slotItems = [
            { symbol: "🍒", weight: 30 },
            { symbol: "🍊", weight: 30 },
            { symbol: "🍓", weight: 30 },  // Commun
            { symbol: "🍋", weight: 20 },  // Commun
            { symbol: "🍇", weight: 10 },  // Moins commun
            { symbol: "💎", weight: 5 },   // Rare
            { symbol: "⭐", weight: 2 },    // Tr\u00e8s rare
        ];

        const totalWeight = slotItems.reduce((acc, item) => acc + item.weight, 0);

        function getRandomSymbol() {
            const random = Math.floor(Math.random() * totalWeight);
            let cumulativeWeight = 0;
            for (const item of slotItems) {
                cumulativeWeight += item.weight;
                if (random < cumulativeWeight) {
                    return item.symbol;
                }
            }
        }

        let number = [];
        for (let i = 0; i < 3; i++) {
            number[i] = getRandomSymbol();
        }

        // Forcer des pertes dans certains cas (30% de chance de perte automatique)
        const loseChance = 30;
        if (Math.random() * 100 < loseChance) {
            number = ["🍒", "🍋", "💎"]; // Combinaison perdante forc\u00e9e
        }

        // Si deux symboles identiques, forcez le troisi\u00e8me \u00e0 \u00eatre diff\u00e9rent
        if (number[0] === number[1]) {
            while (number[2] === number[0]) {
                number[2] = getRandomSymbol();
            }
        }

        // Simulation du défilement des items
        const displayNumbers = async () => {
            let tempNumbers = ["", "", ""];

            for (let i = 0; i < 5; i++) { // Défilement simulé (10 cycles)
                tempNumbers = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('slots_1').setLabel(`${tempNumbers[0]}`).setDisabled(true).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('slots_2').setLabel(`${tempNumbers[1]}`).setDisabled(true).setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('slots_3').setLabel(`${tempNumbers[2]}`).setDisabled(true).setStyle(ButtonStyle.Secondary),
                    );

                const embed = new EmbedBuilder()
                    .setTitle("🎰・Machine à sous")
                    .setDescription(`Tirage en cours...`)
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .addFields({
                        name: "Tableau des gains", value: `
        \`🍓 x3\` → x1.5, \`🍓 x2\` → x0
        \`🍊 x3\` → x1.5, \`🍊 x2\` → x0                
        \`🍒 x3\` → x1.5, \`🍒 x2\` → x0
        \`🍋 x3\` → x1.5, \`🍋 x2\` → x0.8
        \`🍇 x3\` → x2, \`🍇 x2\` → x1
        \`💎 x3\` → x3, \`💎 x2\` → x1.5
        \`⭐ x3\` → x5, \`⭐ x2\` → x2
        `,
                    })
                    .setColor(Colors.Yellow)
                    .setFooter({ text: `Mise: ${mise} coins` });

                await interaction.editReply({ embeds: [embed], components: [row] });
                await new Promise(resolve => setTimeout(resolve, 300)); // Pause de 200ms
            }
        };

        await displayNumbers(); // Afficher le défilement avant de montrer le résultat final

        // Tableau des gains
        const payoutTable = {
            "🍓": { x3: 1.3, x2: 0.5 },
            "🍊": { x3: 1.3, x2: 0.5 },
            "🍒": { x3: 1.3, x2: 0.5 },
            "🍋": { x3: 1.5, x2: 0.8 },
            "🍇": { x3: 2, x2: 1 },
            "💎": { x3: 3, x2: 1.5 },
            "⭐": { x3: 5, x2: 2 },
        };

        function calculatePayout(symbol, matches) {
            if (matches === 3) return payoutTable[symbol].x3;
            if (matches === 2) return payoutTable[symbol].x2;
            return 0;
        }

        let multiplier = 0;
        if (number[0] === number[1] && number[1] === number[2]) {
            multiplier = calculatePayout(number[0], 3);
            money *= multiplier;
            win = true;
        } else if (number[0] === number[1] || number[0] === number[2] || number[1] === number[2]) {
            const matchSymbol = number[0] === number[1] ? number[0] : number[2];
            multiplier = calculatePayout(matchSymbol, 2);
            money = Math.floor(money * multiplier);
            win = true;
        }

        // Boutons pour afficher les résultats
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('slots_1')
                    .setLabel(`${number[0]}`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('slots_2')
                    .setLabel(`${number[1]}`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('slots_3')
                    .setLabel(`${number[2]}`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
            );

        // Envoi des résultats
        if (win) {
            const embed = new EmbedBuilder()
                .setTitle("🎰・Machine à sous")
                .setDescription(`Gain: **${money} coins** après frais de la maison.`)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        
                .addFields({
                    name: "Tableau des gains", value: `
    \`🍓 x3\` → x1.5, \`🍓 x2\` → x0
    \`🍊 x3\` → x1.5, \`🍊 x2\` → x0                
    \`🍒 x3\` → x1.5, \`🍒 x2\` → x0
    \`🍋 x3\` → x1.5, \`🍋 x2\` → x0.8
    \`🍇 x3\` → x2, \`🍇 x2\` → x1
    \`💎 x3\` → x3, \`💎 x2\` → x1.5
    \`⭐ x3\` → x5, \`⭐ x2\` → x2
    `,
                })
                .setColor(Colors.Green)
                .setFooter({ text: `Mise: ${mise} coins` });

            await interaction.editReply({ embeds: [embed], components: [row] });
            data.currency += money;
        } else {
            const embed = new EmbedBuilder()
                .setTitle("🎰・Machine à sous")
                .setDescription(`Vous avez perdu **${mise} coins**.`)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        
                .addFields({
                    name: "Tableau des gains", value: `
    \`🍓 x3\` → x1.5, \`🍓 x2\` → x0
    \`🍊 x3\` → x1.5, \`🍊 x2\` → x0                
    \`🍒 x3\` → x1.5, \`🍒 x2\` → x0
    \`🍋 x3\` → x1.5, \`🍋 x2\` → x0.8
    \`🍇 x3\` → x2, \`🍇 x2\` → x1
    \`💎 x3\` → x3, \`💎 x2\` → x1.5
    \`⭐ x3\` → x5, \`⭐ x2\` → x2
    `,
                })
                .setColor(Colors.Red)
                .setFooter({ text: `Mise: ${mise} coins` });

            await interaction.editReply({ embeds: [embed], components: [row] });
            data.currency -= mise;
        }
        activeGames.delete(interaction.user.id);
        await data.save();
    }
}

module.exports = Slots;
