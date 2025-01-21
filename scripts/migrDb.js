const mongoose = require('mongoose');
const config = require("../config.js");

// Connexion à MongoDB
mongoose.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const MemberData = require('../Schemas/User/MemberDatas.js'); // Assurez-vous que le chemin est correct

(async () => {
    try {
        console.log('🔄 Démarrage de la migration...');

        const result = await MemberData.updateMany(
            { StreamCurrency: { $exists: false } }, // Vérifie si blackjack n'existe pas
            { $set: { StreamCurrency: 0 } }
        );

        console.log(`✅ Migration terminée : ${result.modifiedCount} documents mis à jour.`);
    } catch (error) {
        console.error('❌ Erreur lors de la migration :', error);
    } finally {
        mongoose.connection.close();
        console.log('🔒 Connexion MongoDB fermée.');
    }
})();