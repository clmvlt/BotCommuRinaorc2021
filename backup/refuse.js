const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } = require('discord.js');
const { Modal, TextInputComponent, showModal, MessageComponentTypes } = require('discord-modals') 
const fs = require('fs');

const messages = require('./../data/messages.json');
const dir_profils = './data/profils.json';
const dir_teams = './data/teams.json';
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
    
    var profil = profils.find(p=>p.uuid == team.leader);
    if (!profil)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});

    if (profil.id != it.user.id)
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
    demandes.demandes.splice(dmdIndex, 1);
    fs.writeFileSync(dir_demandes, JSON.stringify(demandes));

    const refuseEmbed = new MessageEmbed();
    refuseEmbed.setColor('RED');
    refuseEmbed.setTitle("REFUSÉ");
    refuseEmbed.setDescription(messages.UserRefuseFromTeam.replace('$user', `<@${demande.authorId}>`));

    it.channel.send({
        embeds:[refuseEmbed]
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