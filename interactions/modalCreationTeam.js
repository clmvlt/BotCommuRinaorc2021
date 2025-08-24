const { MessageEmbed, Message, Interaction, CommandInteraction, MessageActionRow, MessageButton } = require('discord.js');
const { Modal, TextInputComponent, showModal, ModalSubmitInteraction } = require('discord-modals') 
const fs = require('fs');

const messages = require('./../data/messages.json');
const dir_profils = './data/profils.json';
const dir_teams= './data/teams.json';
const profils = require('./../data/profils.json');
const ranks = require('./../data/ranks.json');
const config = require('./../data/config.json');
const teams = require('./../data/teams.json');

/**
 * 
 * @param {ModalSubmitInteraction} modal
 */
module.exports = async function (modal, client) {

    var nom = modal.getField('nom').value
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('btnDisband:' + nom.toLowerCase())
                .setLabel('Disband')
                .setStyle('DANGER')
        );   

        var profil = profils.find(p=>p.id == modal.user.id);
        await modal.deferReply({
            ephemeral: true
        })
        if (!profil)
            return modal.followUp({
                ephemeral: true,
                content: messages.AccountNotLink
            }).catch(()=>{});

        if (teams.find(t=>t.nom.toLowerCase() == nom.toLowerCase())) 
            return modal.followUp({
                ephemeral: true,
                content: messages.TeamAlreadyExist
            }).catch(()=>{});
            
        var tlChannel = await modal.guild.channels.fetch(config.TeamsListChannelId);
        if (!tlChannel)
            return modal.followUp({
                ephemeral: true,
                content: messages.Error
            }).catch(()=>{});

        modal.followUp({
            ephemeral: true,
            content: messages.TeamCreated
        }).catch(()=>{});
       
        var channel = await modal.guild.channels.create(nom, {
            parent: config.TeamsCategoryId,
            permissionOverwrites: [{
                id: modal.guild.roles.everyone,
                allow: ['SEND_MESSAGES'],
                deny: ['VIEW_CHANNEL']
            },
            {
                id: modal.user.id,
                allow: ['VIEW_CHANNEL']
            }
        ]
        }).catch((e)=>{
            console.log(e);
            modal.followUp({
                ephemeral: true,
                content: messages.Error
            }).catch(()=>{});
        })

        await channel.send({
            content: messages.DoInvitetoInvite,
            components: [row]
        }).then(msg=>{
            msg.pin().catch(()=>{});
        }).catch(()=>{});

        var teamEmbed = new MessageEmbed();
        teamEmbed.setTitle(`Nom : \`${nom}\``);
        teamEmbed.setDescription(`Leader : \`${(await modal.guild.members.fetch(profil.id))?.user.tag}\``);
        teamEmbed.setColor('YELLOW');
        teamEmbed.addField("Membres", `<@${profil.id}>`)
        teamEmbed.setFooter({
            iconURL: modal.guild.iconURL(),
            text: messages.EmbedsFooter
        })
        var msg = await tlChannel.send({
            embeds: [teamEmbed]
        }).catch(()=>{
            modal.followUp({
                ephemeral: true,
                content: messages.Error
            }).catch(()=>{});
        });

        var role = await modal.guild.roles.create({
            color: 'YELLOW',
            name: nom
        }).catch(()=>{});

        modal.member.roles.add(role);
        var roleT = await modal.guild.roles.fetch(config.roleTournoisId);
        if (roleT)
            modal.member.roles.add(roleT).catch(()=>{});

        teams.push({
            nom: nom,
            membres: [profil.uuid],
            leader:profil.uuid,
            channelId: channel.id,
            msgId: msg.id,
            roleId: role.id
        })
        require("./../dep.js")(teams.flatMap(t=>t.nom));

        fs.writeFileSync(dir_teams, JSON.stringify(teams));
}