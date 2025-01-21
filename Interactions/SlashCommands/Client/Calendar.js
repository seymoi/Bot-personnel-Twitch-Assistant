const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const { t } = require("i18next");
const TwitchAPI = require('node-twitch').default
const config = require("../../../config");
const twitch = new TwitchAPI({
  client_id: config.twitch.client_id,
  client_secret: config.twitch.client_secret
})

class Calendar extends Command {
  constructor(client, dir) {
    super(client, dir, {
      data: new SlashCommandBuilder()
        .setName("calendar")
        .setDescription("Affiche le programme des streams à venir")
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
    let IsStream = false
    await twitch.getStreams({ channel: client.config.twitch.channel_name }).then(async data => {
      const r = data.data[0]
      if (r) IsStream = true;
    })
    const embed = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle("`📆 Programme                          `");

    if (IsStream) {
      embed.setDescription(`> ### Je stream actuellement! [<:twitch:1309109886751211601> Clic here to see](https://twitch.tv/${client.config.twitch.channel_name})`)
        .setThumbnail("https://cdn.discordapp.com/attachments/1308564541394649171/1311470662426165248/SEY_Persostream.png?ex=6759747b&is=675822fb&hm=1edcbc290a4248b8bb086671062475b47e50b62399a5b677c73c1a3964681ef0&")
    };
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const fields = [];

    for (const day of daysOfWeek) {
      let calendarDay = await client.db.calendarData.findOne({ day });
      if (!calendarDay) {
        calendarDay = new client.db.calendarData({ day, events: [] });
        await calendarDay.save();
      }

      const events = calendarDay.events
        .sort((a, b) => parseInt(a.start.replace(":", "")) - parseInt(b.start.replace(":", ""))) // Trier par heure de début
        .map(event => `\`${event.start}\` - \`${event.end}\` : *${event.description}*`)
        .join('\n') || "`Aucun stream prévu`";

      fields.push({
        name: formatDay(day),
        value: events,
        inline: true
      });
    }

    embed.addFields(fields)
    await interaction.reply({ embeds: [embed] })
  }
}

function formatDay(content) {
  return content.replace("Monday", "Lundi")
    .replace("Tuesday", "Mardi")
    .replace("Wednesday", "Mercredi")
    .replace("Thursday", "Jeudi")
    .replace("Friday", "Vendredi")
    .replace("Saturday", "Samedi")
    .replace("Sunday", "Dimanche")
};

module.exports = Calendar;
