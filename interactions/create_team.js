const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton } = require('discord.js');
const { Modal, TextInputComponent, showModal, MessageComponentTypes } = require('discord-modals') 
const fs = require('fs');

const messages = require('./../data/messages.json');
const dir_profils = './data/profils.json';
const profils = require('./../data/profils.json');
const ranks = require('./../data/ranks.json');
const config = require('./../data/config.json');
const teams = require('./../data/teams.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it, client) {
    var profil = profils.find(p=>p.id == it.user.id);
    if (!profil)
            return modal.followUp({
                ephemeral: true,
                content: messages.AccountNotLink
            }).catch(()=>{});
            
    if (teams.flatMap(t=>t.membres).includes(profil.uuid))
        return it.reply({
            content: messages.AlreadyInTeam,
            ephemeral: true
        }).catch(()=>{});

        const modal = new Modal()
        .setCustomId('fromCreateTeam')
        .setTitle('Créer votre team!')
        .addComponents(
            new TextInputComponent()
            .setCustomId('nom')
            .setLabel('Nom de la team')
            .setStyle('SHORT')
            .setMinLength(2)
            .setMaxLength(20)
            .setPlaceholder('Ex: BedBreaker\'s')
            .setRequired(true)
          );

   showModal(modal, {
       client: client,
       interaction: it
   })

}