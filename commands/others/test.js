const { info } = require('console');
const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton } = require('discord.js');
const { intersection } = require('zod');
const fs = require('fs');

const messages = require('./../../data/messages.json');
const dir_profils = './data/profils.json';
const profils = require('./../../data/profils.json');
const ranks = require('./../../data/ranks.json');
const config = require('./../../data/config.json');

/**
 * 
 * @param {Message} msg
 */
module.exports = function (msg) {
    if (!msg.member.permissions.has('ADMINISTRATOR')) return msg.reply(messages.MissingPerms).catch(()=>{});
    
    var m = "";
    profils.forEach(p=>{
        m = m + "<@"+p.id+">, ";
        if (m.length > 1500) {
            msg.channel.send(m).catch(()=>{});
            m = "";
        }

    })
    msg.channel.send(m).catch(()=>{});
}