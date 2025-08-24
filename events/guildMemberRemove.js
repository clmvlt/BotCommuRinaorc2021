const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton, GuildMember, PartialGuildMember } = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');

const messages = require('./../data/messages.json');
const dir_profils = './data/profils.json';
const dir_invites = './data/invites.json';
const profils = require('./../data/profils.json');
const invites = require('./../data/invites.json');
const ranks = require('./../data/ranks.json');
const teams = require('./../data/teams.json');
const config = require('./../data/config.json');

/**
 * 
 * @param {GuildMember | PartialGuildMember} member
 */
module.exports = async function (member) {
    member.guild.channels.fetch(config.welcomeByeChannelId).then(channel=>{
        const embed = new MessageEmbed();
        embed.setTitle('Départ membre');
        embed.setThumbnail(member.user.avatarURL())
        embed.setDescription(`Au revoir <@${member.id}> ! 👋 (${member.guild.memberCount} membres)`);
        embed.setColor('DARK_RED');
        embed.setFooter({
            text: member.guild.name,
            iconURL: member.guild.iconURL()
        });
        channel.send({
            embeds: [embed]
        }).catch(()=>{});
    }).catch(()=>{});

    var profil = profils.find(p=>p.id==member?.id);
    if (!profil) return;
    var indexProfil = profils.indexOf(profil);
    if (indexProfil < 0) return;
    var team = teams.find(t=>t.membres.find(uuid=>uuid==profil.uuid));
    if (!team) return;
}