const { enable } = require("colors");
const { Schema, model } = require("mongoose");

const PluginsData = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    plugins: {
        type: Object, default: {
            greetings: {
                enabled: false,
            },
            welcome: {
                enabled: false,
                message: null,
                channel: null,
                withImage: null,
            },
            autorole: {
                enabled: false,
                role: null
            },
            twitchalert: {
                enabled: false,
                user: null,
                channel: null
            },
            levels: {
                enabled: true,
                greetings: false,
                channel: null,
            }
        }
    }

});

module.exports = model("PluginsData", PluginsData);
