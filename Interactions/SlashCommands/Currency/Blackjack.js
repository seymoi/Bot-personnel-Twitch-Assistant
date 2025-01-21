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
    Colors,
    Collection
} = require("discord.js");

const { progressBar, msToHMS } = require("../../../Structures/Functions/index");
const activeGames = new Collection();

class Blackjack extends Command {
    constructor(client, dir) {
        super(client, dir, {
            data: new SlashCommandBuilder()
                .setName("blackjack")
                .setDescription("🃏 Mettez vos coins en jeu en jouant au blackjack.")
                .setDMPermission(false)
                .addNumberOption(option =>
                    option.setName('mise')
                        .setDescription("Montant à jouer.")
                        .setRequired(true)
                        .setMinValue(1))
                .addBooleanOption(option =>
                    option.setName("all-in")
                        .setDescription("Souhaitez vous all in ?")
                ),
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

        if (activeGames.has(interaction.user.id)) {
            return await interaction.reply({ content: `Vous avez déjà une partie en cours...`, ephemeral: true })
        }

        activeGames.set(interaction.user.id);

        try {

            let money = parseInt(interaction.options.getNumber('mise'));
            let allin = interaction.options.getBoolean('all-in');

            const query = {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
            };
            let data = await client.db.MemberDatas.findOne(query);
            if (!data) {
                data = new client.db.MemberDatas(query)
                await data.save();
            }

            await interaction.deferReply();

            if (allin) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('allin_yes')
                            .setLabel(`Oui`)
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('allin_no')
                            .setLabel(`Non`)
                            .setStyle(ButtonStyle.Danger),
                    )
                const embed = new EmbedBuilder()
                    .setTitle(`\`🃏 Blackjack: All in ?                        \``)
                    .setDescription(`Vous êtes sur le point de miser ${data.currency} coins ?\n\n*Si vous répondez non votre mise initiale sera jouée.*`)
                    .setTimestamp()
                await interaction.editReply({ embeds: [embed], components: [row] })

                const filter = i => i.user.id === interaction.user.id;
                await interaction.channel.awaitMessageComponent({ filter, max: 1, time: 60000, errors: ["time"] })
                    .then(async i => {
                        if (i.customId == "allin_yes") {
                            money = data.currency;
                            return i.deferUpdate();;
                        } else if (i.customId == "allin_no") {
                            return i.deferUpdate();;
                        }
                    })
                    .catch(_ => {
                         interaction.editReply({content: `Temps de réponse dépassé.`})
                        return;;
                    });
            } 

            if (money > data.currency) {
                activeGames.delete(interaction.user.id);
                return await interaction.editReply({ content: `Vous ne pouvez pas misez plus que ce que vous possèdez. (*Solde: ${data.currency}* coins)`, ephemeral: true });
            }

            var numCardsPulled = 0;
            var gameOver = false;
            var player = {
                cards: [],
                score: 0,
            };
            var dealer = {
                cards: [],
                score: 0,
            };
            function getCardsValue(a) {
                var cardArray = [],
                    sum = 0,
                    i = 0,
                    dk = 10.5,
                    doubleking = "QQ",
                    aceCount = 0;
                cardArray = a;
                for (i; i < cardArray.length; i += 1) {
                    if (
                        cardArray[i].rank === "J" ||
                        cardArray[i].rank === "Q" ||
                        cardArray[i].rank === "K"
                    ) {
                        sum += 10;
                    } else if (cardArray[i].rank === "A") {
                        sum += 11;
                        aceCount += 1;
                    } else if (cardArray[i].rank === doubleking) {
                        sum += dk;
                    } else {
                        sum += cardArray[i].rank;
                    }
                }
                while (aceCount > 0 && sum > 21) {
                    sum -= 10;
                    aceCount -= 1;
                }
                return sum;
            }

            var deck = {
                deckArray: [],
                initialize: function () {
                    var suitArray, rankArray, s, r, n;
                    suitArray = ["b", "d", "g", "s"];
                    rankArray = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
                    n = 13;

                    for (s = 0; s < suitArray.length; s += 1) {
                        for (r = 0; r < rankArray.length; r += 1) {
                            this.deckArray[s * n + r] = {
                                rank: rankArray[r],
                                suit: suitArray[s],
                            };
                        }
                    }
                },
                shuffle: function () {
                    var temp, i, rnd;
                    for (i = 0; i < this.deckArray.length; i += 1) {
                        rnd = Math.floor(Math.random() * this.deckArray.length);
                        temp = this.deckArray[i];
                        this.deckArray[i] = this.deckArray[rnd];
                        this.deckArray[rnd] = temp;
                    }
                },
            };
            deck.initialize();
            deck.shuffle();
            deck.shuffle();
            async function bet(outcome, multiplier = 1) {
                if (outcome === "win") {
                    data.currency += money * multiplier;
                    data.save();
                }
                if (outcome === "lose") {
                    data.currency -= money;
                    data.save();
                }
            }

            function endMsg(f, msg, cl, dealerC) {
                let cardsMsg = "";
                player.cards.forEach(function (card) {
                    var emAR = ["♥", "♦", "♠", "♣"];
                    var t = emAR[Math.floor(Math.random() * emAR.length)];
                    cardsMsg += t + card.rank.toString();
                    if (card.suit == "d1") cardsMsg += "♥";
                    if (card.suit == "d2") cardsMsg += "♦";
                    if (card.suit == "d3") cardsMsg += "♠";
                    if (card.suit == "d4") cardsMsg += "♣";
                    cardsMsg;
                });
                cardsMsg += " = " + player.score.toString();

                var dealerMsg = "";
                // if (!dealerC) {
                //     var emAR = ["♥", "♦", "♠", "♣"];
                //     var t = emAR[Math.floor(Math.random() * emAR.length)];
                //     dealerMsg = t + dealer.cards[0].rank.toString();
                //     if (dealer.cards[0].suit == "d1") dealerMsg += "♥";
                //     if (dealer.cards[0].suit == "d2") dealerMsg += "♦";
                //     if (dealer.cards[0].suit == "d3") dealerMsg += "♠";
                //     if (dealer.cards[0].suit == "d4") dealerMsg += "♣";
                //     dealerMsg;
                // } else {
                dealerMsg = "";
                dealer.cards.forEach(function (card) {
                    var emAR = ["♥", "♦", "♠", "♣"];
                    var t = emAR[Math.floor(Math.random() * emAR.length)];
                    dealerMsg += t + card.rank.toString();
                    if (card.suit == "d1") dealerMsg += "♥";
                    if (card.suit == "d2") dealerMsg += "♦";
                    if (card.suit == "d3") dealerMsg += "♠";
                    if (card.suit == "d4") dealerMsg += "♣";
                    dealerMsg;
                });
                dealerMsg += " = " + dealer.score.toString();
                // }

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('blackjack_hit')
                            .setLabel(`Tirer`)
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId('blackjack_stand')
                            .setLabel(`Rester`)
                            .setStyle(ButtonStyle.Danger),
                    )
                const embed = new EmbedBuilder()
                    .setTitle(`\`🃏 Blackjack                        \``)
                    .setDescription(`${f} \n${msg}`)
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(gameOver ? Colors.Yellow : Colors.Green)
                    .addFields(
                        {
                            name: `\`Vos cartes\``,
                            value: cardsMsg,
                            inline: true,
                        },
                        {
                            name: `\`Le croupier montre\``,
                            value: dealerMsg,
                            inline: true,
                        }
                    )
                    .setFooter({ text: `Mise: ${money} coins` })

                interaction.editReply({ embeds: [embed], components: gameOver ? [] : [row] })
            }

            async function endGame() {
                if (player.cards.length === 2 && player.score === 21) {
                    bet("win", 2.5);
                    gameOver = true;
                    endMsg(
                        `Tu as gagné avec un Blackjack !`,
                        `Félicitation, tu as obtenu un Blackjack (21 avec deux cartes).`,
                        `GREEN`
                    );
                    activeGames.delete(interaction.user.id);
                    return;
                }

                if (dealer.cards.length === 2 && dealer.score === 21) {
                    bet("lose");
                    gameOver = true;
                    endMsg(
                        `Tu as perdu !`,
                        `Le croupier a obtenu un Blackjack (21 avec deux cartes).`,
                        `RED`
                    );
                    activeGames.delete(interaction.user.id);
                    return;
                }

                if (player.score > 21) {
                    bet("lose");
                    gameOver = true;
                    endMsg(
                        `Tu as perdu !`,
                        `Ton score dépasse 21.`,
                        `RED`
                    );
                    activeGames.delete(interaction.user.id);
                    return;
                }

                if (dealer.score > 21) {
                    bet("win");
                    gameOver = true;
                    endMsg(
                        `Tu as gagné !`,
                        `Le croupier dépasse 21.`,
                        `GREEN`
                    );
                    activeGames.delete(interaction.user.id);
                    return;
                }

                if (dealer.score >= 17 && player.score > dealer.score && player.score <= 21) {
                    bet("win");
                    gameOver = true;
                    endMsg(
                        `Tu as gagné !`,
                        `Ton score est supérieur à celui du croupier.`,
                        `GREEN`
                    );
                    activeGames.delete(interaction.user.id);
                    return;
                }

                if (dealer.score >= 17 && player.score < dealer.score && dealer.score <= 21) {
                    bet("lose");
                    gameOver = true;
                    endMsg(
                        `Tu as perdu !`,
                        `Ton score est inférieur à celui du croupier.`,
                        `RED`
                    );
                    activeGames.delete(interaction.user.id);
                    return;
                }

                if (dealer.score >= 17 && player.score === dealer.score) {
                    gameOver = true;
                    endMsg(
                        `Égalité !`,
                        `Ton score est égal à celui du croupier.`,
                        `YELLOW`
                    );
                    activeGames.delete(interaction.user.id);
                    return;
                }
            }

            function dealerDraw() {
                dealer.cards.push(deck.deckArray[numCardsPulled]);
                dealer.score = getCardsValue(dealer.cards);
                numCardsPulled += 1;
            }

            function newGame() {
                hit();
                hit();
                dealerDraw();
                endGame();
            }

            function hit() {
                player.cards.push(deck.deckArray[numCardsPulled]);
                player.score = getCardsValue(player.cards);

                numCardsPulled += 1;
                if (numCardsPulled > 2) {
                    endGame();
                }
            }

            function stand() {
                while (dealer.score < 17) {
                    dealerDraw();
                }
                endGame();
            }
            newGame();
            async function loop() {
                if (gameOver) return;

                endMsg(
                    `Au blackjack, le but est d'atteindre 21 ou de s'en rapprocher sans dépasser, en battant le croupier.`,
                    `*Choisis \`Tirer\` pour recevoir une carte ou \`Rester\` pour conserver ton total actuel.*`,
                    client.color
                );

                const filter = i => i.user.id === interaction.user.id;
                interaction.channel.awaitMessageComponent({ filter, max: 1, time: 120000, errors: ["time"] })
                    .then(async i => {
                        if (i.customId == "blackjack_hit") {
                            hit();
                            loop();
                            return i.deferUpdate();;
                        } else if (i.customId == "blackjack_stand") {
                            stand();
                            loop();
                            return i.deferUpdate();;
                        }
                    })
                    .catch(_ => {
                        gameOver = true;
                        endMsg(
                            `⌛ Temps écoulé`,
                            `Le délai de réponse est écoulé, vous venez de perdre votre mise.`,
                            client.color
                        );;
                        bet("lose");
                        return;
                    });
            }
            await loop();
        } catch (err) {
            console.error(err);

            // Nettoie la partie en cas d'erreur
            activeGames.delete(interaction.user.id);
            await interaction.editReply({
                content: `❌ Une erreur est survenue lors de la partie. Veuillez réessayer.`,
                ephemeral: true
            });
        }
    }
}

module.exports = Blackjack;
