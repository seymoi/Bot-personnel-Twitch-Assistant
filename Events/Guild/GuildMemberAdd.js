const Event = require("../../Structures/Classes/BaseEvent");
const {
    Events,
    CommandInteraction,
    InteractionType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    AttachmentBuilder,
    Colors,
} = require("discord.js");
const { Logger } = require("../../Structures/Functions/index");
const logger = new Logger();
const { resolve } = require("path");
const Canvas = require("canvas");
const { log } = require("console");
Canvas.registerFont(resolve("./assets/fonts/theboldfont.ttf"), { family: "Bold" });


const applyText = (canvas, text, defaultFontSize) => {
    const ctx = canvas.getContext("2d");
    do {
        ctx.font = `${defaultFontSize -= 10}px Bold`;
    } while (ctx.measureText(text).width > 600);
    return ctx.font;
};

class GuildMemberAdd extends Event {
    constructor(client) {
        super(client, {
            name: Events.GuildMemberAdd,
        });
    }

    async execute(member) {
        const { client } = this;

        try {
            await member.guild.members.fetch();
            let guildData = await client.db.PluginsData.findOne({ guildId: member.guild.id });
            if (!guildData) {
                guildData = new client.db.PluginsData({ guildId: member.guild.id });
                await guildData.save();
            }

            if (guildData.plugins.autorole.enabled) {
                member.roles.add(guildData.plugins.autorole.role).catch((error) => { logger.error(`Erreur détectée dans l'attribution du rôle automatique. ${error}`)});
            }

            if (guildData.plugins.greetings.enabled) {
                const guild = member.guild;
                const specificUser = await client.users.fetch(client.config.developers[0].id);
                const embed = new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle(`\`Bienvenue ${member.user.username}                          \``)
                    .setDescription("Merci d'avoir rejoint le serveur!\n*Quand est-ce que le prochain stream est prévu ? Utilises `/calendar` !*")
                    .setAuthor({
                        name: specificUser.tag, // Nom de l'utilisateur spécifique
                        iconURL: specificUser.displayAvatarURL({ dynamic: true }), // Image de profil de l'utilisateur spécifique
                    })
                    .setThumbnail(guild.iconURL({ dynamic: true })) // Icône du serveur
                    .setTimestamp()

                const bvn = new ButtonBuilder()
                    .setCustomId("bvnbtn")
                    .setLabel(`Envoyé depuis: ${guild.name}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);

                const row = new ActionRowBuilder().addComponents(bvn);

                await member.send({ embeds: [embed], components: [row] })
            }

            if (guildData.plugins.welcome.enabled) {
                const messages = [
                    "Vient de nous rejoindre",
                    "Viens d'arriver in extremis",
                    "Arrive avec quelques minutes de retard",
                    "Viens d'atterrir",
                ];
                const message = messages[Math.floor(Math.random() * messages.length)];

                const channel = member.guild.channels.cache.get(guildData.plugins.welcome.channel);
                if (channel) {

                    if (guildData.plugins.welcome.withImage) {
                        const canvas = Canvas.createCanvas(1024, 450),
                            ctx = canvas.getContext("2d");

                        // Background language
                        const background = await Canvas.loadImage("./assets/img/greetings_background.png");
                        // This uses the canvas dimensions to stretch the image onto the entire canvas
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        // Draw username
                        ctx.fillStyle = "#eff153";
                        const username = member.user.globalName ? member.user.globalName : member.user.username;
                        ctx.font = applyText(canvas, username, 85);
                        ctx.fillText(username, canvas.width - 650, canvas.height - 230);
                        ctx.fillStyle = "#c1c10b";
                        const id = member.user.id
                        ctx.font = applyText(canvas, `(${id})`, 25);
                        ctx.fillText(`(${id})`, canvas.width - 650, canvas.height - 210);
                        // Draw server name
                        ctx.fillStyle = "#eff153";
                        ctx.font = applyText(canvas, message, 50);
                        ctx.fillText(message, canvas.width - 650, canvas.height - 125);
                        // Draw number
                        ctx.font = "26px Bold";
                        ctx.fillStyle = "#eff153";
                        ctx.fillText(`SEYsonnier n°${member.guild.memberCount}`, 80, canvas.height - 22);
                        // Draw Title with gradient
                        // ctx.font = "90px Bold";
                        // ctx.strokeStyle = "#1d2124";
                        // ctx.lineWidth = 15;
                        // ctx.strokeText("Bienvenue", canvas.width - 620, canvas.height - 330);
                        // var gradient = ctx.createLinearGradient(canvas.width - 780, 0, canvas.width - 30, 0);
                        // gradient.addColorStop(0, "#e15500");
                        // gradient.addColorStop(1, "#e7b121");
                        // ctx.fillStyle = gradient;
                        // ctx.fillText("Bienvenue", canvas.width - 620, canvas.height - 330);

                        // Pick up the pen
                        ctx.beginPath();
                        //Define Stroke Line
                        ctx.lineWidth = 15;
                        //Define Stroke Style
                        ctx.strokeStyle = "#eff153";
                        // Start the arc to form a circle
                        ctx.arc(180, 225, 135, 0, Math.PI * 2, true);
                        // Draw Stroke
                        ctx.stroke();
                        // Put the pen down
                        ctx.closePath();
                        // Clip off the region you drew on
                        ctx.clip();

                        const options = { extension: "png", size: 512 },
                            avatar = await Canvas.loadImage(member.user.displayAvatarURL(options));
                        // Move the image downwards vertically and constrain its height to 200, so it"s a square
                        ctx.drawImage(avatar, 45, 90, 270, 270);
                        const buffer = canvas.toBuffer('image/png');
                        const attachment = new AttachmentBuilder(buffer, { name: "image.png" });

                        const embed = new EmbedBuilder()
                            .setTitle(`\`Nouveau membre: ${member.user.username}                          \``)
                            .setImage('attachment://image.png')
                            .setColor(Colors.Yellow)
                            .setTimestamp()

                        channel.send({
                            embeds: [embed],
                            files: [attachment],
                            allowedMentions: {
                                parse: ["users", "everyone", "roles"]
                            }
                        });
                    } else {
                        const message = guildData.plugins.welcome.message
                            .replace(/{user}/g, member)
                            .replace(/{server}/g, member.guild.name)
                            .replace(/{membercount}/g, member.guild.memberCount);
                        channel.send(message, {
                            allowedMentions: {
                                parse: ["users", "everyone", "roles"]
                            }
                        });
                    }
                }
            }


        } catch (error) {
            logger.error(error);
        }
    }
}

module.exports = GuildMemberAdd;
