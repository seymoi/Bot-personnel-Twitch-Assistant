const { enable } = require("colors");
const { Schema, model } = require("mongoose");

const MemberSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    },
    messagesSend: {
        type: Number,
        default: 0,
    },
    msgXp: {
        type: Number,
        default: 0
    },
    timeInVocal: {
        type: Number,
        default: 0,
    },
    vocXp: {
        type: Number,
        default: 0
    },
    currency: {
        type: Number,
        default: 0
    },
    daily: {
        type: Date,
        default: null
    },
    StreamCurrency: {
        type: Number,
        default: 0
    }

});

module.exports = model("MemberDatas", MemberSchema);
