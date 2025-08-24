const { MessageEmbed, Message, Interaction, CommandInteraction } = require('discord.js');
const msToHms = require('ms-to-hms');
const messages = require('./../../data/messages.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it) {
    const api = new (require('./../../api/connect.js'));

    return it.reply({
        ephemeral: true,
        content: 'Dev en cours'
    });

    var leaderboard = await api.getLeaderboards();
    console.log(leaderboard.leaderboards.bedwars.wins.total);
}