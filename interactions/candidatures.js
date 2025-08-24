const { Message, MessageEmbed, MessageActionRow, MessageButton, inter, Buttoninter } = require('discord.js');
const fs = require('fs');

// JSON
const candidature_gestion = require('./../data/candidature_gestion.json');
const emotes_reaction = require('./../data/emotes_reaction.json');
const messages = require('./../data/messages.json');
const config = require('./../data/config.json');

/**
 * @param {Buttoninter} inter
 */
module.exports = async function (inter) {
    var args = inter.customId.split(';');
    var poste = args[1];

    var cibledCandid = candidature_gestion.find(c=>c.poste==poste);
    if (!poste || !cibledCandid) {
        return inter.channel.send(messages.Error).then(m=>{
            setTimeout(() => {
                m.delete().catch(()=>{});
            }, 3000);
        }).catch(()=>{});
    }

    const filter = m => m.author.id === inter.user.id;
    var canDM = true;
    await inter.user.send('Salut!\n Je vais te poser quelques questions pour ta candidature.').catch(()=>{
        canDM = false;
        inter.channel.send(`<@${inter.user.id}>, je n'arrive pas à t'envoyer un message!`).then(m=>{
            setTimeout(() => {
                m.delete()
            }, 3000);
        })
    })
    if (!canDM) return;

    var questions = cibledCandid.questions;
    var reponses = [];
    var indexQuestion = 0;
    console.log('Candidature en cours...');
    var candidat = inter.user;

    var poserQuestions = async function (question) {
        if (question=="Expiré") {
            console.log('Candidature expiré');
            inter.user.send('Le délai de réponse a expiré. Merci de recommencer votre candidature.').catch(()=>{});
            return;
        }
        if (question == null) {
            inter.user.send("Merci pour ta candidature! Je te recontacterais pour la réponse!").catch(()=>{});
            
            var channel = await inter.guild.channels.create(cibledCandid.poste + "-" + inter.user.username, {
                parent: cibledCandid.idCategoryCandidsResponses,
                permissionOverwrites: [
                    {
                        id: inter.guild.id,
                        deny: ['VIEW_CHANNEL']
                    },
                    {
                        id: config.roleStaffId,
                        allow: ['VIEW_CHANNEL']
                    }
                ]
            }).catch(()=>{})
            
            if (!channel) {
                console.log('ERREUR AVEC UNE CANDID');
                return inter.user.send(messages.Error).catch(()=>{});
            }

            var candidature = `Candidature de <@${candidat.id}> !`;
            questions.forEach(question=>{
                var indexQuestion = questions.indexOf(question);
                if (indexQuestion == -1) return;
                if ((candidature.length + question.length + reponses[indexQuestion].length) > 2000) {
                    channel.send(candidature).catch(()=>{});
                    candidature = '';
                }
                candidature += `\n\n**${question}**\n\n${reponses[indexQuestion]}`;
            })
            if (candidature != null) channel.send(candidature).catch(()=>{});

            console.log('Candidature envoyé!');
            return;
        }

        var lastMsg = await inter.user.send((indexQuestion + 1) + " - " + question).catch(()=>{});
        const collector = lastMsg.channel.createMessageCollector({ filter, time: 240000, max: 1 });
        collector.on('collect', m => { reponses.push(m.content) });

        collector.on('end', async collected => {
            if (collected.size == 0) return poserQuestions('Expiré');
            indexQuestion++;
            return poserQuestions(questions[indexQuestion]);
        })
    }

    poserQuestions(questions[indexQuestion]);
}