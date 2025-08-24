const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } = require('discord.js');
const { Modal, TextInputComponent, showModal, MessageComponentTypes } = require('discord-modals') 
const fs = require('fs');

const messages = require('./../data/messages.json');
const dir_profils = './data/profils.json';
const profils = require('./../data/profils.json');
const ranks = require('./../data/ranks.json');
const config = require('./../data/config.json');
const teams = require('./../data/teams.json');
const dir_demandes = './data/demandesJoinTeam.json';
const demandes = require('./../data/demandesJoinTeam.json');

/**
 * 
 * @param {ButtonInteraction<CacheType>} it
 */
module.exports = async function (it) {
    var dmdId = parseInt(it.customId.split(':')[1]);
    var demande = demandes.demandes.find(d=>d.id === dmdId);
    
    if (!demande)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});
        
    var dmdIndex = demandes.demandes.indexOf(demande);
    if (dmdIndex < 0)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});

    var team = teams.find(t=>t.nom.toLowerCase() == demande.nomTeam);
    if (!team)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});

    if (it.user.id != demande.authorId)
        return it.reply({
            ephemeral: true,
            content: messages.YourNotAuthorOfTheDemande
        }).catch(()=>{});

    it.message.delete().catch(()=>{
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});
    })
    demandes.demandes.splice(dmdIndex, 1);
    fs.writeFileSync(dir_demandes, JSON.stringify(demandes));
}