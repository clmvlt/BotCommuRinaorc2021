const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton, GuildMember } = require('discord.js');
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
 * @param {GuildMember} member
 */
module.exports = async function (member) {
    member.guild.channels.fetch(config.welcomeByeChannelId).then(channel=>{
        const embed = new MessageEmbed();
        embed.setTitle('Nouveau membre');
        embed.setThumbnail(member.user.avatarURL());
        embed.setDescription(`Tiens <@${member.id}> à rejoint le serveur! 👋 (${member.guild.memberCount} membres)`);
        embed.setColor('DARK_GREEN');
        embed.setFooter({
            text: member.guild.name,
            iconURL: member.guild.iconURL()
        });
        channel.send({
            embeds: [embed]
        }).catch(()=>{});
    }).catch(()=>{});

    if (member.guild.id != config.guildId || member.guild.id != config.guildDevId) return;
    var profil = profils.find(p=>p.id==member.id);
    if (profil) return;
    const api = new (require('./../api/connect.js'));
    var infos = await api.getPlayer(member.user.username);
    if (!infos.success) return;
    if (infos.player.links.discord !== member.id) return;

    profils.push({
        id: it.user.id,
        uuid: infos.player.uuid
    })

    fs.writeFileSync(dir_profils, JSON.stringify(profils));
    console.log('new link : ' + member.user.username);
}