const TwitchAPI = require('node-twitch').default
const config = require("../../config");
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, Colors, time, TimestampStyles } = require("discord.js");
const moment = require('moment');
moment.locale('fr');
const twitch = new TwitchAPI({
    client_id: config.twitch.client_id,
    client_secret: config.twitch.client_secret
})

module.exports = async (client) => {
    let IsLiveMemory = false
    let mess;

    let ThisGuildOnly = client.guilds.cache.get("1208769358214602793")
    const run = async function Run() {
        let guildData = await client.db.PluginsData.findOne({ guildId: ThisGuildOnly.id });
        if (!guildData) {
            guildData = new client.db.PluginsData({ guildId: ThisGuildOnly.id });
            await guildData.save();
        }

        if (guildData.plugins.twitchalert.enabled) {
            const icon = "https://cdn.discordapp.com/attachments/1308564541394649171/1311470661696225384/SEY_Perso.png?ex=6748f9bb&is=6747a83b&hm=3b75181c9c10ffd0916656c37d145a7448379c188cb585f2005a702b0e4aff0e&";
            const iconStream = "https://cdn.discordapp.com/attachments/1308564541394649171/1311470662426165248/SEY_Persostream.png?ex=6748f9bb&is=6747a83b&hm=4eb8f07c33c42be6aaa89825a19b949a59ba745f65788023bafd93e95e04667d&";
            const channel = ThisGuildOnly.channels.cache.get(guildData.plugins.twitchalert.channel);
            if (channel) {
                await twitch.getStreams({ channel: guildData.plugins.twitchalert.user }).then(async data => {
                    const r = data.data[0]

                    const ChannelAnnounceLive = ThisGuildOnly.channels.cache.find(x => x.id === guildData.plugins.twitchalert.channel)

                    if (r !== undefined) {
                        const date = new Date(moment(r.started_at).format())
                        const embed = new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setAuthor({ name: `${r.user_name} est en stream !`, url: `https://twitch.tv/${guildData.plugins.twitchalert.user}`, })
                            .setDescription(`### 🎬 - **${r.title}**`)
                            .setTimestamp()
                            .addFields(
                                {
                                    name: "Catégorie",
                                    value: `\`${r.game_name}\``,
                                    inline: true
                                },
                                {
                                    name: '\u200b',
                                    value: '\u200b',
                                    inline: true
                                },
                                {
                                    name: 'Commencé',
                                    value: `${time(date, TimestampStyles.RelativeTime)}`,
                                    inline: true
                                }
                            )
                            .setFooter({ text: `👀 ${r.viewer_count} viewers` })
                            .setThumbnail(iconStream)
                            .setImage(`${r.getThumbnailUrl()}`);

                        const confirm = new ButtonBuilder()
                            .setURL(`https://twitch.tv/${guildData.plugins.twitchalert.user}`)
                            .setLabel("Aller sur le stream")
                            .setEmoji("1309109886751211601")
                            .setStyle(ButtonStyle.Link);

                        const row = new ActionRowBuilder().addComponents(confirm);
                        if (r.type === "live") {
                            if (IsLiveMemory === false || IsLiveMemory === undefined) {
                                IsLiveMemory = true
                                // ThisGuildOnly.setIcon(iconStream)
                                mess = await ChannelAnnounceLive.send({ content: "<@&1280103995578388612>", embeds: [embed], components: [row] });
                            } else if (IsLiveMemory === true) {
                                //  ThisGuildOnly.setIcon(iconStream)
                                mess.edit({ embeds: [embed], components: [row] });
                            }
                        } else {

                            if (IsLiveMemory === true) {
                                IsLiveMemory = false
                                const em = new EmbedBuilder(mess.embeds[0])
                                    .setAuthor({ name: `stream terminé`, url: `https://twitch.tv/${guildData.plugins.twitchalert.user}`, })
                                    .setFooter({ text: `/calendar pour voir les prochains streams!` })
                                    .setThumbnail(icon)
                                // ThisGuildOnly.setIcon(icon)
                                mess.edit({ content: " ", embeds: [em] })
                            }
                        }
                    } else {
                        if (IsLiveMemory === true) {
                            IsLiveMemory = false
                            const em = new EmbedBuilder(mess.embeds[0])
                                .setAuthor({ name: `stream terminé`, url: `https://twitch.tv/${guildData.plugins.twitchalert.user}`, })
                                .setFooter({ text: `/calendar pour voir les prochains streams!` })
                                .setThumbnail(icon)
                            // ThisGuildOnly.setIcon(icon)
                            mess.edit({ content: " ", embeds: [em] })
                        }
                    }
                })
            }
        }

    }
    setInterval(run, 5000 * 60)
}