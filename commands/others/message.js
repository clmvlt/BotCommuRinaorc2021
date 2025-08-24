const { MessageEmbed, Message, Interaction, CommandInteraction } = require('discord.js');
const { Modal, TextInputComponent, showModal, MessageComponentTypes } = require('discord-modals') 
const fs = require('fs');
const fetch = require('node-fetch');

const messages = require('./../../data/messages.json');
const dir_profils = './data/profils.json';
const profils = require('./../../data/profils.json');
const ranks = require('./../../data/ranks.json');
const teams = require('./../../data/teams.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it, client) {

    const modal = new Modal()
        .setCustomId('formMessage')
        .setTitle('MESSAGE')
        .addComponents(
            new TextInputComponent()
            .setCustomId('title')
            .setLabel('Titre (facultatif)')
            .setStyle('SHORT')
            .setMinLength(0)
            .setMaxLength(200)
            .setPlaceholder('Règles')
            .setRequired(false)
            .setDefaultValue(it.guild.name)
          )
        .addComponents(
        new TextInputComponent()
        .setCustomId('contenu')
        .setLabel('Message')
        .setStyle('LONG')
        .setMinLength(1)
        .setMaxLength(3900)
        .setRequired(true)
        )
        .addComponents(
            new TextInputComponent()
            .setCustomId('footer')
            .setLabel('Pied de page (facultatif)')
            .setStyle('SHORT')
            .setMinLength(0)
            .setMaxLength(200)
            .setPlaceholder('Pied de page')
            .setRequired(false)
            .setDefaultValue(it.guild.name)
        )
        .addComponents(
            new TextInputComponent()
            .setCustomId('mention')
            .setLabel('Mention')
            .setStyle('SHORT')
            .setMinLength(0)
            .setMaxLength(200)
            .setRequired(false)
            .setDefaultValue("<@&ROLEID>")
        );

   showModal(modal, {
       client: client,
       interaction: it
   })
}