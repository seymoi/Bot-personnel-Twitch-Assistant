const { Schema, model } = require("mongoose");

const GameKeySchema = new Schema({
    gameName: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // Clé unique
    isSold: { type: Boolean, default: false }, // Indique si la clé a été vendue
});

module.exports = model('GameKey', GameKeySchema);