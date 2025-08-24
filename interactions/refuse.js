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
const dir_invites = './data/invites.json';
const invites = require('./../data/invites.json');

/**
 * 
 * @param {ButtonInteraction<CacheType>} it
 */
module.exports = async function (it) {
    var inviteId = parseInt(it.customId.split(':')[1]);
    var invite = invites.invites.find(i=>i.id === inviteId);
    
    if (!invite)
        return it.reply({
            ephemeral: true,
            content: messages.InviteExpire
        }).catch(()=>{});
    var inviteIndex = invites.invites.indexOf(invite);
    if (inviteIndex < 0)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});
        
    var team = teams.find(t=>t.nom.toLowerCase() == invite.nomteam.toLowerCase());
    if (!team)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});

    var profil = profils.find(p=>p.id == it.user.id);
    if (!profil)
        return it.reply({
            ephemeral: true,
            content: messages.AccountNotLink
        }).catch(()=>{});

    if (it.user.id != invite.userId)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});

    invites.invites.splice(inviteIndex, 1);
    fs.writeFileSync(dir_invites, JSON.stringify(invites));

    const refuseEmbed = new MessageEmbed();
    refuseEmbed.setColor('RED');
    refuseEmbed.setTitle("REFUSÉ");
    refuseEmbed.setDescription(messages.UserRefuseFromTeam.replace('$user', `<@${invite.userId}>`));

    it.reply({
        embeds:[refuseEmbed]
    }).catch(()=>{
        it.reply({
            content: messages.Error,
            ephemeral: true
        })
    })

    it.client.guilds.fetch('967903640494936124').then(guild=>{
        guild.channels.fetch(team.channelId).then(channel=>{
            channel.send({
                embeds:[refuseEmbed]
            }).catch((e)=>{console.log(e)});
            channel.permissionOverwrites.edit(it.user.id, {
                VIEW_CHANNEL: false
            })
        });
    }).catch((e)=>{console.log(e)});
}