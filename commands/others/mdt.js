const { Message, MessageEmbed, MessageActionRow, MessageButton, CommandInteraction } = require('discord.js');

// JSON
const messages = require('./../../data/messages.json');
const config = require('./../../data/config.json');

/**
 * @param {Message} msg
 */
module.exports = async function (msg) {
    if (msg.channel.id == '961562633465659453') {
        msg.channel.send(`<@&961558846348865536>`).catch(()=>{});
    } else {
        msg.reply(messages.WrongChannel).catch(()=>{});
    }
   
}