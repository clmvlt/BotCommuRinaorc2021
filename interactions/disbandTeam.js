const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } = require('discord.js');
const { Modal, TextInputComponent, showModal, MessageComponentTypes } = require('discord-modals') 
const fs = require('fs');

const messages = require('./../data/messages.json');
const dir_profils = './data/profils.json';
const dir_invites = './data/invites.json';
const dir_teams = './data/teams.json';
const profils = require('./../data/profils.json');
const ranks = require('./../data/ranks.json');
const config = require('./../data/config.json');
const teams = require('./../data/teams.json');
const invites = require('./../data/invites.json');


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

    var nomteam = it.customId.split(':')[1];
    var team = teams.find(t=>t.nom.toLowerCase() == nomteam)

    if (!team) 
        return it.reply({
            content: messages.Error,
            ephemeral: true
        }).catch(()=>{});

    if (team.leader !== profil.uuid) 
        return it.reply({
            content: messages.YourNotOwnerOfThisTeam,
            ephemeral: true
        }).catch(()=>{});

    var indexTeam = teams.indexOf(team);

    if (indexTeam < 0) 
        return it.editReply({
            content: messages.Error,
            ephemeral: true
        }).catch(()=>{});

    it.reply(messages.Confirm).catch(()=>{})

    const filter = m => m.author.id === it.user.id;
    const collector = it.channel.createMessageCollector({ filter, time: 10_000, max: 1});
    var confirm = false;
    collector.on('collect', async m => { 
        if (m.content != 'CONFIRM') return;
        confirm = true
    });

    collector.on('end', async collected => {
        if (!confirm) return it.editReply({
            ephemeral: true,
            content: messages.Expire
        }).catch((e)=>{console.log(e)});

        invites.invites.forEach(invite=>{
            if (invite.nomteam.toLowerCase() == team.nom.toLowerCase()) {
                invites.invites.slice(invites.invites.indexOf(invite), 1);
            }
        })

        teams.splice(indexTeam, 1);
        fs.writeFileSync(dir_teams, JSON.stringify(teams));

        var teamChan = await it.guild.channels.fetch(team.channelId);
        await it.guild.roles.delete(await it.guild.roles.fetch(team.roleId));

        team.membres.forEach(async uuid=>{
            var profil = profils.find(p=>p.uuid==uuid);
            if (!profil) return;
            var member = await it.guild.members.fetch(profil.id).catch(()=>{});
            if (!member) return;
            member.roles.remove(await it.guild.roles.fetch(config.roleTournoisId)).catch(()=>{});
        });
        
        teamChan.delete().catch((e)=>{
            it.channel.send(messages.TeamChanNotDel).catch(()=>{});
        })

        it.guild.channels.fetch(config.TeamsListChannelId).then(channel=>{
            channel.messages.fetch(team.msgId).then(msg=>{
                msg.delete().catch(()=>{});
            })
        })

        require("./../dep.js")(teams.flatMap(t=>t.nom));

        return it.reply({
            content: messages.TeamDisbanded,
            ephemeral: true
        }).catch(()=>{});
    })
}