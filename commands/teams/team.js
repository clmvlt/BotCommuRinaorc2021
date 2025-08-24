const { info } = require('console');
const { MessageEmbed, Message, Interaction, CommandInteraction } = require('discord.js');
const { isMainThread } = require('worker_threads');
const { intersection } = require('zod');
const fs = require('fs');
const fetch = require('node-fetch');

const messages = require('./../../data/messages.json');
const dir_profils = './data/profils.json';
const profils = require('./../../data/profils.json');
const ranks = require('./../../data/ranks.json');
const teams = require('./../../data/teams.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it) {
    
    var nomTeam = it.options.get('nom_team').value;
    var team = teams.find(t=>t.nom.toLowerCase() == nomTeam);

    if (!team)
        return it.reply({
            content: messages.Error,
            ephemeral: true
        });

    function getPseudo(uuid) {
        return fetch('https://minecraft-api.com/api/pseudo/'+uuid+'/json').then(response => {
            return response.json();
        }).then(json => {
            return json.pseudo;
        }).catch(()=>{
            return 'invalid_uuid';
        });
    };

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    var listMembres = [];

    await asyncForEach(team.membres, async (m) => {
        listMembres.push(await getPseudo(m));
    });

    var embedTeam = new MessageEmbed()
    .setTitle(`🔰 ${team.nom} 🔰`)
    .setColor('GOLD')
    .setDescription(`Leader : ${await getPseudo(team.leader)}`)
    .addField("Membres", `${listMembres.join('\n')}`)
    .setFooter({
        text: messages.EmbedsFooter,
        iconURL: it.guild.iconURL()
    });
    it.reply({
        embeds:[embedTeam]
    }).catch(()=>{
        it.reply(messages.Error).catch(()=>{})
    });
}