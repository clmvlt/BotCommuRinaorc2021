const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton } = require('discord.js');
const { Modal, TextInputComponent, showModal, ModalSubmitInteraction } = require('discord-modals') 
const fs = require('fs');

const messages = require('./../data/messages.json');
const dir_profils = './data/profils.json';
const dir_teams= './data/teams.json';
const profils = require('./../data/profils.json');
const ranks = require('./../data/ranks.json');
const config = require('./../data/config.json');
const teams = require('./../data/teams.json');

/**
 * 
 * @param {ModalSubmitInteraction} modal
 */
module.exports = async function (modal, client) {

    var message = modal.getField('contenu').value;
    var mention = modal.getField('mention')?.value;
    var title = modal.getField('title')?.value;
    var footer = modal.getField('footer')?.value;

    await modal.deferReply({
        ephemeral: true
    })
    
    
    var embed = new MessageEmbed();
    if (title) embed.setTitle(title);
    embed.setColor('YELLOW');
    embed.setDescription(message);
    embed.setFooter({
        iconURL: modal.guild.iconURL(),
        text: footer ? footer : modal.user.username
    })
    await modal.channel.send({
        ephemeral: false,
        embeds: [embed]
    }).catch(()=>{

    });
    if (mention) modal.channel.send({
        ephemeral: false,
        content: mention
    }).catch(()=>{

    });

    modal.followUp({
        content: messages.Done,
        ephemeral: true
    }).catch(()=>{
        
    });
}