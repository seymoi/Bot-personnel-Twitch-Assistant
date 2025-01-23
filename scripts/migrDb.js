const mongoose = require('mongoose');
const config = require("../config.js");

// Connexion à MongoDB
mongoose.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ Connexion à MongoDB réussie.');
}).catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB :', err);
});

const MemberDatas = require('../Schemas/User/MemberDatas.js'); // Assurez-vous que le chemin est correct

(async () => {
    try {
        console.log('🔄 Démarrage de la migration...');

        const result = await MemberDatas.updateMany(
            { twitchId: { $exists: false } }, // Vérifie si twitchId n'existe pas
            { $set: { twitchId: null } }
        );

        console.log(`✅ Migration terminée : ${result.modifiedCount} documents mis à jour.`);
    } catch (error) {
        console.error('❌ Erreur lors de la migration :', error);
    } finally {
        mongoose.connection.close().then(() => {
            console.log('🔒 Connexion MongoDB fermée.');
        }).catch((err) => {
            console.error('❌ Erreur lors de la fermeture de la connexion MongoDB :', err);
        });
    }
})();