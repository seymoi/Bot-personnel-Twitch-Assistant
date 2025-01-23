const axios = require('axios');



async function SteamInfo(gameName) {
    try {
        // Étape 1 : Rechercher le jeu et récupérer son appId
        const searchResponse = await axios.get(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(gameName)}`);
        const games = searchResponse.data;

        if (!games || games.length === 0) {
            //     return `❌ Aucun jeu trouvé avec le nom "${gameName}".`;
            return null;
        }

        // Prenons le premier jeu de la liste
        const game = games[0];
        const appId = game.appid;

        // Étape 2 : Récupérer les détails du jeu via l'appId
        const gameDetailsResponse = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
        const gameDetails = gameDetailsResponse.data[appId];

        if (!gameDetails.success) {
            // return `❌ Impossible de récupérer les détails du jeu "${gameName}".`;
            return null;
        }

        // Informations sur le jeu
        const gameInfo = gameDetails.data;
        const {
            name,
            short_description,
            header_image,
            price_overview,
            developers,
            publishers
        } = gameInfo;

        // Formatage des informations
        return {
            name: name || "Inconnu",
            description: short_description || "Aucune description disponible.",
            image: header_image || null,
            price: price_overview ? `${price_overview.final / 100} ${price_overview.currency}` : "Gratuit",
            developers: developers && developers.length > 0 ? developers.join(", ") : "Non spécifié",
            publishers: publishers && publishers.length > 0 ? publishers.join(", ") : "Non spécifié"
        };
    } catch (error) {
        console.error(`❌ Erreur lors de la récupération des infos du jeu :`, error);
        // return "❌ Une erreur est survenue lors de la récupération des informations du jeu.";
        return null;
    }
}




module.exports = { SteamInfo };