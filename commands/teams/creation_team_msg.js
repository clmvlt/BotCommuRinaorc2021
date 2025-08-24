const { info } = require('console');
const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton } = require('discord.js');
const { intersection } = require('zod');
const fs = require('fs');

const messages = require('./../../data/messages.json');
const dir_profils = './data/profils.json';
const profils = require('./../../data/profils.json');
const ranks = require('./../../data/ranks.json');
const config = require('./../../data/config.json');

var template = config.prefix+'creation_team_msg [message]'

/**
 * 
 * @param {Message} msg
 */
module.exports = async function (msg) {
    if (!msg.member.permissions.has('ADMINISTRATOR')) return msg.reply(messages.MissingPerms).catch(()=>{});
    var args = msg.content.split(' ');
    if (args.length < 2) return msg.reply(messages.InvalidArg.replace('$template', template)).catch(()=>{});

    args.shift();

    const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('btnCreateTeam')
					.setLabel('Créer sa team')
					.setStyle('SUCCESS')
			);

    msg.channel.send({
        content: args.join(' '),
        components: [row]
    }).catch(()=>{});
}