const { Schema, model } = require("mongoose");

const calendarSchema = new Schema({
    day: { type: String, required: true }, // "Monday", "Tuesday", ...
    events: [{
        start: { type: String, required: true }, // "21:00"
        end: { type: String, required: true },   // "23:00"
        description: { type: String, required: true } // Event description
    }]
});

module.exports = model('Calendar', calendarSchema);