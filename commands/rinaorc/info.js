const { info } = require('console');
const { MessageEmbed, Message, Interaction, CommandInteraction } = require('discord.js');
const msToHms = require('ms-to-hms');
const { isMainThread } = require('worker_threads');
const { intersection } = require('zod');

const messages = require('./../../data/messages.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it) {
    const api = new (require('./../../api/connect.js'));

    var pseudo = it.options.get('pseudo').value;
    var infos = await api.getPlayer(pseudo);

    if (!infos.success) return it.reply({
        content: messages.InvalidPseudo,
        ephemeral: true
    });

    mois = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "décembre"]
    var date = new Date(infos.player.lastLogin);
    var lastLoginDate = "Le " + date.getDate().toString() + " " + mois[date.getMonth()] + " " + date.getUTCFullYear() + " à " + date.toLocaleTimeString().split(':')[0] + "h" + date.toLocaleTimeString().split(':')[1];
    if (lastLoginDate.includes('undefined')) lastLoginDate = "Le " + date.toLocaleDateString() + " à " + date.toLocaleTimeString().split(':')[0] + "h" + date.toLocaleTimeString().split(':')[1];

    var date = new Date(infos.player.firstLogin);
    var firstLoginDate =  "Le " + date.getDate().toString() + " " + mois[date.getMonth()] + " " + date.getUTCFullYear() + " à " + date.toLocaleTimeString().split(':')[0] + "h" + date.toLocaleTimeString().split(':')[1];
    if (firstLoginDate.includes('undefined')) firstLoginDate = "Le " + date.toLocaleDateString() + " à " + date.toLocaleTimeString().split(':')[0] + "h" + date.toLocaleTimeString().split(':')[1];

    var user = await it.guild.members.fetch(infos.player.links.discord).catch(()=>{return null});
    
    const InfosEmbed = new MessageEmbed();
    InfosEmbed.setTitle('✨ ' + infos.player.name + ' ✨');
    InfosEmbed.setColor('YELLOW');
    InfosEmbed.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
    InfosEmbed.setDescription((infos.player.isOnline ? "\🟢 Connecté" : "\🔴 Hors ligne") + 
    "\n\n**Dernière connexion : **`" + lastLoginDate + "`" +
    "\n**Première connexion : **`" + firstLoginDate +"`" +
    "\n**Temps de jeu : **`" + msToHms(infos.player.totalPlayedTime).split(':')[0] + `h (${msToHms(infos.player.monthlyPlayedTime).split(':')[0]}h ce mois-ci)` +"`" +
    "\n**Grade : **`" + infos.player.rank.name + "`" +
    "\n**Aura : **`" + infos.player.aura + "`" +
    "\n**Discord : **`" + (user != null && user.user != null ? `${user.user.tag}\`` : "sans`") +
    "\n**Twitter : **`" + (infos.player.links.twitter ? `@${infos.player.links.twitter}\`` : "sans`"));
    InfosEmbed.setFooter({
        text: messages.EmbedsFooter,
        iconURL: it.guild.iconURL()
    });

    it.reply({
        embeds:[InfosEmbed]
    }).catch(e=>{
        console.log(e);
        it.reply(messages.Error);
    });
}