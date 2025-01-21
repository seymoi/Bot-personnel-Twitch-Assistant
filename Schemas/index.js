const mongoose = require("mongoose");
const botDatas = require("./Bot/BotDatas");
const languageDatas = require("./Server/LanguageData");
const redeemCodes = require("./Bot/RedeemCode");
const calendarData = require("./Calendar/Calendar");
const PluginsData = require("./Server/Plugins");
const MemberDatas = require("./User/MemberDatas");
const GameKeys = require("./GameKeys/GameKey");
const AchievementsData = require("./User/Achievements");
const { Logger } = require("../Structures/Functions/index");
const logger = new Logger();

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
/**
 *
 * @param {import("../Structures/Classes/BotClient").BotClient} client
 */

function ConnectMongo(client) {
  if (client.config.mongoUrl) {
    logger.info("Trying to connect with database...");
    mongoose.set("strictQuery", false);
    mongoose
      .connect(client.config.mongoUrl)
      .then((data) => {
        logger.success(
          `Database has been connected to: "${data.connection.name}"`
        );
        createBackup(data)
        setInterval(() => {
          logger.info("⏰ Nouvelle sauvegarde planifiée.");
          createBackup(data);
        }, 48 * 60 * 60 * 1000); // Toutes les 24 heures
      })
      .catch((err) => logger.error(err));
  } else logger.warn(`You forget to add mongoUrl in config.js`);
}

const config = {
  dbName: "test",
  backupDir: "./Backups", // Dossier où les sauvegardes seront stockées
  keepDays: 7 // Nombre de jours de sauvegardes à conserver
};

async function createBackup(data) {
  const db = data.connection.db;

  try {


    const collections = await db.listCollections().toArray();

    const backup = {};
    for (const collection of collections) {
      const name = collection.name;
      logger.info(`📦 Exportation de la collection : ${name}`);
      const col = db.collection(name);
      const docs = await col.find().toArray();
      backup[name] = docs;
    }

    const date = new Date().toISOString().split('T')[0];
    const backupPath = path.join(config.backupDir, `${config.dbName}-${date}.json`);

    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    logger.success(`✅ Sauvegarde terminée : ${backupPath}`);
    await cleanOldBackups(config);
  } catch (err) {
    logger.error(`❌ Erreur lors de la sauvegarde :${err}`);
  }
}

// Fonction pour supprimer les anciennes sauvegardes
function cleanOldBackups(config) {
  const backupDir = config.backupDir;
  const keepDuration = config.keepDays * 24 * 60 * 60 * 1000; // Durée de conservation en millisecondes

  // Vérifie si le répertoire existe avant de continuer
  if (!fs.existsSync(backupDir)) {
    logger.error(`❌ Le répertoire des sauvegardes n'existe pas : ${backupDir}`);
    return;
  }

  fs.readdir(backupDir, (err, files) => {
    if (err) {
      logger.error(`❌ Erreur lors de la lecture du répertoire des sauvegardes : ${err}`);
      return;
    }

    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(backupDir, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error(`❌ Erreur lors de l'accès aux informations du fichier "${file}" : ${err}`);
          return;
        }

        console.log(`📄 Fichier : ${file}`);
        console.log(`    - Dernière modification (mtime) : ${new Date(stats.mtimeMs)}`);
        console.log(`    - Âge en millisecondes : ${Date.now() - stats.mtimeMs}`);

        // Calcul de l'âge en jours
        const fileAge = (Date.now() - stats.mtimeMs) / (24 * 60 * 60 * 1000);
        console.log(`    - Âge en jours : ${fileAge.toFixed(2)}`);

        if (Date.now() - stats.mtimeMs > keepDuration) {
          console.log(`🟢 Le fichier "${file}" est plus vieux que ${config.keepDays} jours et sera supprimé.`);
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error(`❌ Erreur lors de la suppression du fichier "${file}" : ${err}`);
            } else {
              logger.success(`🗑️ Fichier supprimé : ${file}`);
            }
          });
        } else {
          console.log(`🟡 Le fichier "${file}" est encore dans la période de conservation (${fileAge.toFixed(2)} jours).`);
        }
      });
    });
  });
}
// Assurez-vous que le répertoire de sauvegarde existe
if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}


module.exports = {
  ConnectMongo,
  cleanOldBackups,
  createBackup,
  botDatas,
  redeemCodes,
  languageDatas,
  calendarData,
  PluginsData,
  MemberDatas,
  GameKeys,
  AchievementsData
};
