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

    if (teams.flatMap(t=>t.membres).find(id=>id == profil.uuid)) 
        return it.reply({
            ephemeral: true,
            content: messages.AlreadyInTeam
        }).catch(()=>{});

    invites.invites.splice(inviteIndex, 1);
    fs.writeFileSync(dir_invites, JSON.stringify(invites));

    const acceptEmbed = new MessageEmbed();
    acceptEmbed.setColor('GREEN');
    acceptEmbed.setTitle("ACCEPTÉ");
    acceptEmbed.setDescription(messages.UserAcceptFromTeam.replace('$user', `<@${invite.userId}>`));

    it.reply({
        embeds:[acceptEmbed]
    }).catch(()=>{
        it.reply({
            content: messages.Error,
            ephemeral: true
        })
    })

    team.membres.push(profil.uuid);
    fs.writeFileSync(dir_teams, JSON.stringify(teams));

    it.client.guilds.fetch('967903640494936124').then(async guild=>{
        await guild.channels.fetch(team.channelId).then(channel=>{
            channel.send({
                embeds:[acceptEmbed]
            }).catch((e)=>{console.log(e)});
        });
        await guild.channels.fetch(config.TeamsListChannelId).then(channel=>{
            channel.messages.fetch(team.msgId).then(async msg=>{

                var listMembres = [];
                async function asyncForEach(array, callback) {
                    for (let index = 0; index < array.length; index++) {
                        await callback(array[index], index, array);
                    }
                }
    
                await asyncForEach(team.membres, async (m) => {
                    var profil = profils.find(p=>p.uuid==m);
                    if (profil!=null)
                        listMembres.push(profil.id);
                });

                var teamEmbed = new MessageEmbed();
                teamEmbed.setTitle(msg.embeds[0]?.title);
                teamEmbed.setDescription(msg.embeds[0]?.description);
                teamEmbed.setColor('YELLOW');
                teamEmbed.addField("Membres", `<@${listMembres.join('>, <@')}>`);
                teamEmbed.setFooter({
                    iconURL: msg.guild.iconURL(),
                    text: messages.EmbedsFooter
                })
                msg.edit({
                    embeds:[teamEmbed]
                }).catch(()=>{});
            })
        });
        guild.members.fetch(it.user.id).then(async member=>{
            var role = await guild.roles.fetch(team.roleId);
            member.roles.add(role).catch(()=>{});
            role = await guild.roles.fetch(config.roleTournoisId);
            member.roles.add(role).catch(()=>{});
        });
    }).catch((e)=>{console.log(e)});
}