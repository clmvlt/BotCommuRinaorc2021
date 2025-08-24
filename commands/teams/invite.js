const { info } = require('console');
const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton } = require('discord.js');
const { isMainThread } = require('worker_threads');
const { intersection } = require('zod');
const fs = require('fs');
const fetch = require('node-fetch');

const messages = require('./../../data/messages.json');
const dir_profils = './data/profils.json';
const dir_invites = './data/invites.json';
const profils = require('./../../data/profils.json');
const invites = require('./../../data/invites.json');
const ranks = require('./../../data/ranks.json');
const teams = require('./../../data/teams.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it) {
    
    var user = it.options.getUser('discord');
    var authorProfil = profils.find(p=>p.id == it.user.id);
    var userProfil = profils.find(p=>p.id == user.id);
    var team = teams.find(t=>t.leader == authorProfil.uuid);

    if (!team)
        return it.reply({
            ephemeral: true,
            content: messages.NoOwnTeam
        }).catch(()=>{});
    if (!user || !authorProfil)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});

    if (user.bot)
        return it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});

    var duplicatInvite = invites.invites.find(i=>i.userId == user.id && i.nomteam.toLowerCase() == team.nom.toLowerCase());
    if (duplicatInvite)
        return it.reply({
            content: messages.DuplicatedInvite,
            ephemeral: true
        }).catch(()=>{});

    if (teams.flatMap(t=>t.membres).find(id=>id == userProfil?.uuid)) 
        return it.reply({
            ephemeral: true,
            content: messages.UserAlreadyInTeam
        }).catch(()=>{});

    var userLinked = false;
    if (!userProfil) {
        it.reply({
            ephemeral: true,
            content: messages.UserNotLinkInviteSent
        }).catch(()=>{});
    } else {
        userLinked = true;
    }

    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('btnAccept:' + invites.nbInvites.toString())
            .setLabel('Accepter')
            .setStyle('SUCCESS')
    )
    .addComponents(
        new MessageButton()
            .setCustomId('btnRefuse:' + invites.nbInvites.toString())
            .setLabel('Refuser')
            .setStyle('DANGER')
    );

    invites.invites.push({
        id: invites.nbInvites,
        nomteam: team.nom,
        userlinked: userLinked,
        userId: user.id
    });
    invites.nbInvites++;
    fs.writeFileSync(dir_invites, JSON.stringify(invites));

    const inviteEmbed = new MessageEmbed();
    inviteEmbed.setTitle('Vous avez reçu une invitation!');
    inviteEmbed.setColor('GREEN');
    inviteEmbed.setDescription(userLinked ? "Votre compte est lié!\nVous pouvez accepter cette invitation sans soucis!" : `/!\\ VOTRE COMPTE N'EST PAS LIÉ /!\\\nAfin d'éviter les doubles comptes nous exigeons aux utilisateur de lier leur compte discord et leur compte minecraft.\n\nPour plus d'infos faîtes \`/link\`.`);
    inviteEmbed.setFooter({
        iconURL: it.guild.iconURL(),
        text: messages.EmbedsFooter
    });
    inviteEmbed.addField(
        `Invité par \`${it.user.tag}\``,
        `\`${it.user.tag}\` vous a invité à rejoindre la team : \`${team.nom}\``
    );

    user.send({
        embeds: [inviteEmbed],
        components: [row]
    }).catch(()=>{
        it.editReply({
            ephemeral: true,
            content: messages.ICantMpThisUser
        }).catch(()=>{});
        it.channel.send({
            embeds: [inviteEmbed],
            content: `<@${user.id}>`,
            components: [row]
        }).catch(()=>{});
    })

    it.reply({
        ephemeral: true,
        content: messages.Done
    }).catch(()=>{});

    it.guild.channels.fetch(team.channelId)?.then(async channel=>{
        channel.permissionOverwrites.edit(user.id, {
            VIEW_CHANNEL: true
        })
    })
}