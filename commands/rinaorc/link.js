const { info } = require('console');
const { MessageEmbed, Message, Interaction, CommandInteraction } = require('discord.js');
const { isMainThread } = require('worker_threads');
const { intersection } = require('zod');
const fs = require('fs');

const messages = require('./../../data/messages.json');
const dir_profils = './data/profils.json';
const profils = require('./../../data/profils.json');
const ranks = require('./../../data/ranks.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it) {
    const api = new (require('./../../api/connect.js'));

    if (profils.find(p=>p.id==it.user.id)) return it.reply({
        content: messages.AccountAlreadyLinked,
        ephemeral: true
    });

    var pseudo = it.options.get('pseudo').value;
    var infos = await api.getPlayer(pseudo);

    if (!infos.success) return it.reply({
        content: messages.InvalidPseudo,
        ephemeral: true
    });

    if (infos.player.links.discord == null) return it.reply({
        content: messages.AccountNotLink,
        ephemeral: true
    });

    if (infos.player.links.discord !== it.user.id) return it.reply({
        content: messages.AccountNotLinkToThisDisc,
        ephemeral: true
    });

    ranks.forEach(async rank=>{
        var rankRole = await it.guild.roles.fetch(rank.roleId).catch(()=>{});
        if (rankRole != null) {
            it.member.roles.remove(rankRole).catch(()=>{});
        }
    })

        var rank = ranks.find(r=>r.name==infos.player.rank.name);
        if (rank != null) {
            var rankRole = await it.guild.roles.fetch(rank.roleId).catch(()=>{});
            it.member.roles.add(rankRole).catch(()=>{});
        }
        
        profils.push({
            id: it.user.id,
            uuid: infos.player.uuid
        })

    const InfosEmbed = new MessageEmbed();
    InfosEmbed.setTitle('✨ ' + infos.player.name + ' ✨');
    InfosEmbed.setColor('YELLOW');
    InfosEmbed.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
    InfosEmbed.setDescription(messages.AccountLinked);
    InfosEmbed.setFooter({
        text: "©. " + it.guild.name,
        iconURL: it.guild.iconURL()
    });

    it.reply({
        embeds:[InfosEmbed],
        ephemeral: false
    });

    fs.writeFileSync(dir_profils, JSON.stringify(profils))
}