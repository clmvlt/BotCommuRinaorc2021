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
const dir_teams = './data/teams.json';
const demandes = require('./../data/demandesJoinTeam.json');

/**
 * 
 * @param {ButtonInteraction<CacheType>} it
 */
module.exports = async function (it, client) {
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
        
    var profilLead = profils.find(p=>p.uuid == team.leader);
    if (!profilLead)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});

    if (profilLead.id != it.user.id)
        return it.reply({
            ephemeral: true,
            content: messages.YourNotOwnerOfThisTeam
        }).catch(()=>{});

    it.message.delete().catch(()=>{
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});
    })
    var profil = profils.find(p=>p.id == demande.authorId);
    demandes.demandes.splice(dmdIndex, 1);
    fs.writeFileSync(dir_demandes, JSON.stringify(demandes));
    team.membres.push(profil.uuid);
    fs.writeFileSync(dir_teams, JSON.stringify(teams));

    const acceptEmbed = new MessageEmbed();
    acceptEmbed.setColor('GREEN');
    acceptEmbed.setTitle("ACCEPTÉ");
    acceptEmbed.setDescription(messages.UserAcceptFromTeam.replace('$user', `<@${demande.authorId}>`));

    it.channel.send({
        embeds:[acceptEmbed]
    }).catch(()=>{
        it.reply({
            content: messages.Error,
            ephemeral: true
        })
    })

    it.channel.messages.fetch(team.msgId).then(m=>{
        m.delete();
    }).catch(()=>{});

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('btnRejoindre:' + team.nom.toLowerCase())
                .setLabel('Rejoindre')
                .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
                .setCustomId('btnDisband:' + team.nom.toLowerCase())
                .setLabel('Disband')
                .setStyle('DANGER')
        );   

    var msg = await it.channel.send({
        content: messages.RequestTeamJoin,
        components: [row]
    }).catch(()=>{});
    team.msgId = msg.id;
    fs.writeFileSync(dir_teams, JSON.stringify(teams));
}