const { enable } = require("colors");
const { Schema, model } = require("mongoose");

const AchievementsSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },

    achievements: {
        type: Object, default: {
            // FAIRE SA PREMIERE COMMANDE
            command: {
                achieved: false,
                reward: 10,
                progress: {
                    now: 0,
                    total: 1
                }
            },
            messages: {
                level1: {
                    achieved: false,
                    reward: 50,
                    progress: {
                        total: 100
                    }
                },
                level2: {
                    achieved: false,
                    reward: 100,
                    progress: {
                        total: 500
                    }
                },
                level3: {
                    achieved: false,
                    reward: 250,
                    progress: {
                        total: 1000
                    }
                }
            },
            vocal: {
                level1: {
                    achieved: false,
                    reward: 50,
                    progress: {
                        total: 3600000
                    }
                },
                level2: {
                    achieved: false,
                    reward: 100,
                    progress: {
                        total: 72000000
                    }
                },
                level3: {
                    achieved: false,
                    reward: 250,
                    progress: {
                        total: 360000000
                    }
                }
            },
        },

    }
});

module.exports = model("AchievementsData", AchievementsSchema);
