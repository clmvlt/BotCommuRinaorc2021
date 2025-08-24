const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');

const messages = require('./../../data/messages.json');
const config = require('./../../data/config.json');
const dir_profils = './data/profils.json';
const dir_invites = './data/invites.json';
const dir_teams = './data/teams.json';
const profils = require('./../../data/profils.json');
const invites = require('./../../data/invites.json');
const ranks = require('./../../data/ranks.json');
const teams = require('./../../data/teams.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it) {
    
    var profil = profils.find(p=>p.id == it.user.id);
    var team = teams.find(t=>t.membres.find(uuid=>uuid==profil?.uuid));
    var i = team?.membres.indexOf(profil?.uuid);

    if (!profil || !team || i < 0) 
        return it.reply({
            content: messages.Error,
            ephemeral: true
        });
    if (profil.uuid == team.leader)
        return it.reply({
            content: messages.YourTheOwner,
            ephemeral: true
        })

    team.membres.splice(i, 1);
    fs.writeFileSync(dir_teams, JSON.stringify(teams));

    var roleTournois = await it.guild.roles.fetch(config.roleTournoisId);
    var roleTeam = await it.guild.roles.fetch(team.roleId);
    it.member.roles.remove(roleTournois).catch(()=>{});
    it.member.roles.remove(roleTeam).catch(()=>{});

    const leaveEmbed = new MessageEmbed();
    leaveEmbed.setColor('RED');
    leaveEmbed.setTitle("DÉPART");
    leaveEmbed.setDescription(messages.UserLeavedFromTeam.replace('$user', `<@${it.user.id}>`));

    var guild = it.guild;
    await guild.channels.fetch(team.channelId).then(channel=>{
        channel.send({
            embeds:[leaveEmbed]
        }).catch(()=>{});
        channel.permissionOverwrites.edit(it.user.id, {
            VIEW_CHANNEL: false
        }).catch(()=>{});
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

    it.reply({
        content: messages.LeavedTeam,
        ephemeral: true
    })

}