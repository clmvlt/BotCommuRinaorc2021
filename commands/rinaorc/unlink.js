const { info } = require('console');
const { MessageEmbed, Message, Interaction, CommandInteraction } = require('discord.js');
const { isMainThread } = require('worker_threads');
const { intersection } = require('zod');
const fs = require('fs');

const messages = require('./../../data/messages.json');
const dir_profils = './data/profils.json';
const profils = require('./../../data/profils.json');
const teams = require('./../../data/teams.json');
const ranks = require('./../../data/ranks.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it) {
    var profil = profils.find(p=>p.id==it.user.id);
    if (!profil) return it.reply({
        content: messages.AccountNotLink,
        ephemeral: true
    });

    if (teams.flatMap(t=>t.membres).find(m=>m==profil.uuid)) return it.reply({
        content: messages.YouAreInTeam,
        ephemeral: true
    });

    var profil = profils.find(p=>p.id==it.user.id);
    var index = profils.indexOf(profil);
    profils.splice(index, 1);

    fs.writeFileSync(dir_profils, JSON.stringify(profils));

    const InfosEmbed = new MessageEmbed();
    InfosEmbed.setTitle('✨ ' + it.user.username + ' ✨');
    InfosEmbed.setColor('YELLOW');
    InfosEmbed.setDescription(messages.AccountUnlinked);
    InfosEmbed.setFooter({
        text: "©. " + it.guild.name,
        iconURL: it.guild.iconURL()
    });

    ranks.forEach(async rank=>{
        var rankRole = await it.guild.roles.fetch(rank.roleId).catch(()=>{});
        if (rankRole != null) {
            it.member.roles.remove(rankRole).catch(()=>{});
        }
    })


    it.reply({
        embeds:[InfosEmbed],
        ephemeral: false
    });
}