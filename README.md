# 🕹️ Stream Bot Assistant

Streamer Assistant Bot est un bot Discord développé avec [Discord.js](https://discord.js.org/)  pour aider les streamers à interagir avec leur communauté et à gérer efficacement leur serveur Discord. Ce bot offre des fonctionnalités personnalisées adaptées aux besoins des créateurs de contenu tout en apportant des outils généraux pour la gestion d’un serveur.


<3 [Base de l'Handler](https://github.com/jasonmidul/Discord.js-v14-Bot-Handler) prise de [Jason Midul](https://github.com/jasonmidul) merci a lui !

---

## Fonctionnalités principales

### 🎥 STREAM
- **📢 Notifications de Stream**
    > - Le bot envoie automatiquement une notification lorsqu’un stream commence, avec un message personnalisé et le lien vers le stream.
- **📆 Gestion de planning**
    > - Gérer votre planning facilement pour tenir vos viewers au courant.
- **🪙 Monnaie**
    > - Une monnaie obtenable en envoyant des messages ou en restant en vocal.

### 🎁 Interactions avec les Viewers
- **Cadeaux et récompenses :** Offrez des clés Steam ou d’autres récompenses à vos viewers directement sur Discord.

### 🛠️ Gestion de Serveur Discord
- **Acceuil et rôles automatique :** Acceuillez vos membres avec une image personnalisée et leur attribuer un rôle automatique.
- **Statistiques et classements :** Affichez les utilisateurs les plus actifs dans différentes catégories, comme le nombre de messages envoyés ou le temps en vocal.

---

## 🖼️ Preview
<details>
  <summary>Afficher les images</summary>
  <h3>Notifications de stream<br />
<img src="/assets/preview/img1.png" alt="Notif1"><br />
<img src="/assets/preview/img2.png" alt="Notif2" ><br />
  <h3>Clé<br />
<img src="/assets/preview/img3.png" alt="key1" ><br />
<img src="/assets/preview/img4.png" alt="key2"><br />
  <h3>Planning<br />
<img src="/assets/preview/img5.png" alt="Planning" ><br />
</details>

---

## 🚀 Futures Améliorations
- [x] Notifications de stream  
- [x] Distribution de clés Steam  
- [x] Système de planning (edit et view)
- [ ] Commandes de configurations
- [ ] Commandes de modération avancées  
- [ ] Intégration pour un [futur chat bot twitch](https://github.com/seymoi/Twitch-Bot)

---

## Prérequis
- Node.js (version 16 ou supérieure).
- Une base de données MongoDB pour stocker les statistiques des membres et autres données persistantes.
- Une clé API Twitch pour les notifications de stream.
---
## Installation
1. Clonez ce dépôt :
```bash
git clone https://github.com/seymoi/Bot-personnel-Twitch-Assistant.git
cd votre-repo
```
2. Installez les dépendances :
```bash
npm install
```
3. Configurez le fichier `.env` :
```javascript
# discord secrets
 token = "token"
 clientId ="id"

# mongodb database url
mongoUrl = "url"

# webhook urls
logWebhook = "url"

# log channels
logChannel = ""


twitchId = ""
twitchToken = ""
```
4. Configurez le fichier `config.js` :
```javascript
module.exports = {
  botToken: process.env.token,
  mongoUrl: process.env.mongoUrl,
  clientId: process.env.clientId,
  logChannel: process.env.logChannel,

  twitch: {
    client_id: process.env.twitchId,
    client_secret: process.env.twitchToken,
    channel_name: VOTRE CHAINE TWITCH
  },

  deploySlashOnReady: true,
  underDevelopment: true,
  developers: [
    {
      name: VOTRE NOM,
      id: VOTRE ID,
    },
    
  ],
  devGuilds: [
    {
      name: NOM SERVEUR DEV,
      id: ID SERVEUR DEV,
    },
  ],
  betaTestGuilds: ["ID SERVEUR BETA"],
  logWebhook: process.env.logWebhook,
};
```
5. Lancez le bot :
```bash
node index.js
```

---

## 🤝 Contribuer
Les contributions sont les bienvenues ! Si vous souhaitez ajouter de nouvelles fonctionnalités ou corriger des bugs, ouvrez une issue ou soumettez une pull request.

## Licence
Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, de le modifier et de le redistribuer.

## Remerciements
Un grand merci à la communauté et à tous ceux qui contribuent au développement de ce projet.

---

**Contact :** Pour toute question ou suggestion, veuillez me contacter via Discord (*seymoi*) ouvrir une *issue* sur GitHub.

**Ma chaine Twitch :** https://twitch.tv/seymoii

## **Laisser une étoile sur le projet si vous l'aimez et ça donne énormément de force !**

