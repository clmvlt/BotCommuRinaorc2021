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
module.exports = async function (it, client) {
    var profil = profils.find(p=>p.id == it.user.id);
    if (!profil)
        return it.reply({
            ephemeral: true,
            content: messages.AccountNotLink
        }).catch(()=>{});


    if (teams.flatMap(t=>t.membres).includes(profil.uuid))
        return it.reply({
            content: messages.AlreadyInTeam,
            ephemeral: true
        }).catch(()=>{});

    if (demandes.demandes.find(d=>d.authorId == it.user.id))
        return it.reply({
            content: messages.AlreadyRequestForJoinATeam,
            ephemeral: true
        }).catch(()=>{});

    var nom = it.customId.split(':')[1];
    var dmdId = demandes.nbDemandes;
    demandes.nbDemandes++;

    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('btnAccepte:' + dmdId.toString())
            .setLabel('Accepter')
            .setStyle('SUCCESS')
    )
    .addComponents(
        new MessageButton()
            .setCustomId('btnRefuse:' + dmdId.toString())
            .setLabel('Refuser')
            .setStyle('DANGER')
    )
    .addComponents(
        new MessageButton()
            .setCustomId('btnAnnulJoin:' + dmdId.toString())
            .setLabel('Annuler')
            .setStyle('SECONDARY')
    );

    it.deferUpdate();

    var dmdMsg = await it.channel.send({
        content: messages.UserWantToJoin.replace('$user', `<@${it.user.id}>`),
        components: [row]
    }).catch((e)=>{
        console.log(e);
        it.reply({content:messages.Error, ephemeral: true});
    }).catch(()=>{});

    demandes.demandes.push({
        "messageId": dmdMsg.id,
        "authorId": it.user.id,
        "nomTeam": nom,
        "id": dmdId
    })

    fs.writeFileSync(dir_demandes, JSON.stringify(demandes));
}