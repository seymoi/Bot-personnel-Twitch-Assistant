const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");

class EditCalendar extends Command {
  constructor(client, dir) {
    super(client, dir, {
      data: new SlashCommandBuilder()
        .setName("editcalendar")
        .setDescription("Permets de modifier le programme de la semaine.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
          option.setName('day')
            .setDescription('Le jour à modifier (ex: Monday).')
            .setRequired(true)
            .addChoices(
              { name: 'Monday', value: 'Monday' },
              { name: 'Tuesday', value: 'Tuesday' },
              { name: 'Wednesday', value: 'Wednesday' },
              { name: 'Thursday', value: 'Thursday' },
              { name: 'Friday', value: 'Friday' },
              { name: 'Saturday', value: 'Saturday' },
              { name: 'Sunday', value: 'Sunday' }
            )
        )
        .addStringOption(option =>
          option.setName('start')
            .setDescription('Heure de début au format HH:mm.')
        )
        .addStringOption(option =>
          option.setName('end')
            .setDescription('Heure de fin au format HH:mm.')
        )
        .addStringOption(option =>
          option.setName('event')
            .setDescription('Le nouvel événement pour cette plage horaire.')
        )
        .addBooleanOption(option =>
          option.setName('reset')
            .setDescription('Réinitialiser tous les événements pour ce jour.')
        ),
      options: {
     
        devOnly: true,
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
    const day = interaction.options.getString('day');
    const start = interaction.options.getString('start');
    const end = interaction.options.getString('end');
    const event = interaction.options.getString('event');
    const reset = interaction.options.getBoolean('reset');

    let calendarDay = await client.db.calendarData.findOne({ day });
    if (!calendarDay) {
      calendarDay = new client.db.calendarData({ day, events: [] });
    }

    if (reset) {
      calendarDay.events = [];
      await calendarDay.save();
      return interaction.reply(`Tous les événements pour ${day} ont été réinitialisés.`);
    }

    if (start && end && event) {
      // Valider les formats HH:mm
      if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
        return interaction.reply('Les heures doivent être au format HH:mm (ex: 21:00).');
      }

      // Extraire les heures et minutes pour comparaison
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);

      // Vérifier la validité de la plage horaire (inclut jusqu'à 00:00)
      const isValid =
        (startHour < endHour || (startHour === endHour && startMinute < endMinute)) ||
        (startHour > endHour) ||
        (endHour === 0 && endMinute === 0); // Cas où la fin est à minuit

      if (!isValid) {
        return interaction.reply('L\'heure de début doit être avant l\'heure de fin ou traverser minuit.');
      }

      // Ajouter ou mettre à jour l'événement
      const existingEventIndex = calendarDay.events.findIndex(
        e => e.start === start && e.end === end
      );
      if (existingEventIndex >= 0) {
        calendarDay.events[existingEventIndex].description = event;
      } else {
        calendarDay.events.push({ start, end, description: event });
      }

      // Trier les événements par heure de début
      calendarDay.events.sort((a, b) => {
        const [aHour, aMinute] = a.start.split(':').map(Number);
        const [bHour, bMinute] = b.start.split(':').map(Number);

        return aHour !== bHour ? aHour - bHour : aMinute - bMinute;
      });

      await calendarDay.save();
      return interaction.reply(`L'événement de \`${start}\` à \`${end}\` pour ${day} a été mis à jour en : "${event}".`);
    }

    return interaction.reply('Veuillez spécifier une plage horaire (`start`, `end`) et un événement, ou choisissez de réinitialiser.');
  }
}

module.exports = EditCalendar;
