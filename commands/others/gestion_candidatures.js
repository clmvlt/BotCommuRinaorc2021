const { Message, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');

// JSON
const candidature_gestion = require('./../../data/candidature_gestion.json');
const emotes_reaction = require('./../../data/emotes_reaction.json');
const messages = require('./../../data/messages.json');
const config = require('./../../data/config.json');

// JSON LOCATION FOR FS
const dir_candidature_gestion = './data/candidature_gestion.json';

// VARIABLES
const template = config.prefix + "candidature [type] [poste]";

/**
 * @param {Message} msg
 */
module.exports = async function (msg) {
    if (!msg.member.permissions.has('ADMINISTRATOR') && msg.guild.id == '695426953833873499') return msg.reply(messages.MissingPerms).catch(()=>{});
    var args = msg.content.split(' ');

    // LISTE TYPE : create, show, edit
    var types = ["create", "show", "edit", "list"];
    var cmd = args[0], type = args[1], poste = args[2], editcmd = args[3];

    if (!type || !types.find(t=>t==type)) return msg.reply(messages.MissingArgsFromList.replace('${arg}', "type").replace("${args}", types.join(', ')).replace("${template}", template)).catch(()=>{});
    if (type != 'list' && !poste) return msg.reply(messages.MissingArgs.replace('${arg}', "poste").replace("${template}", template)).catch(()=>{});

    const filter = m => m.author.id === msg.author.id;

    const filterReact = (reaction, user) => {
        return user.id === msg.author.id;
    };
    
    switch (type) {
        case "create":
            if (candidature_gestion.find(c=>c.poste==poste)) return msg.reply(messages.CandidatureAlreadyExist).catch(()=>{}); 

            var visedChannel, msgContent, visedCategory;
            var isOk = false;
            var mBot = await msg.reply(`Êtes-vous sûr de vouloir créer un formulaire de candidature pour le poste de ${poste} ? (15s)`).catch(()=>{});
            mBot.react(emotes_reaction.YES);
            mBot.react(emotes_reaction.NO);

            const collector = mBot.createReactionCollector({filter: filterReact, time: 15_000, max: 1 });

            collector.on('collect', async (reaction, user) => { 
                switch (reaction.emoji.name) {
                    case emotes_reaction.YES:
                        isOk = true;
                        break;
                    case emotes_reaction.NO:
                        msg.reply("Annulé.").catch(()=>{});
                        break;
                    default:
                        msg.reply(messages.IncorrectEmote).catch(()=>{}); 
                }
            });

            collector.on('end', async (reactions) =>{
                if (reactions.size == 0) return msg.reply(messages.Expire).catch(()=>{});
                if (!isOk) return;

                // CHOIX CHANNEL
                msg.reply(`Dans quel salon envoyer le message avec le bouton pour postuler ? (120s)`).catch(()=>{});
                const collector = msg.channel.createMessageCollector({ filter, time: 120_000, max: 10 });

                var channel = null;
                collector.on('collect', async m => { 
                    if (m.content == null) return msg.reply(messages.InvalidChannel).catch(()=>{});
                    var channelId = m.content.replace('<', '').replace('>', '').replace('#', '');
                    channel = await m.guild.channels.fetch(channelId).catch(()=>{});

                    if (channel == null) return msg.reply(messages.InvalidChannel).catch(()=>{});
                    if (channel.type != "GUILD_TEXT") return msg.reply(messages.InvalidChannel).catch(()=>{});
                    msg.reply(`Salon choisi : \`${channel.name}\``).catch(()=>{});
                    visedChannel = channel;
                    collector.stop();
                });

                collector.on('end', async collected => {
                    if (collected.size == 0 || channel == null) return msg.reply(messages.Expire).catch(()=>{});

                    // CHOIX CONTENU MESSAGE
                    msg.reply(`Indiquez le contenu du message au-dessus du bouton pour postuler :`).catch(()=>{});
                    const collector = msg.channel.createMessageCollector({ filter, time: 120_000, max: 1 });

                    collector.on('collect', async m => { 
                        if (m.content == null) return msg.reply(messages.Expire).catch(()=>{});
                        
                        msgContent = m.content;
                        msg.reply(`Message : \`${msgContent}\``).catch(()=>{});
                    });

                    collector.on('end', async collected => {
                        if (collected.size == 0 || channel == null) return msg.reply(messages.Expire).catch(()=>{});
                        
                        // CHOIX CATEGORIE
                        msg.reply(`Dans quelle catégorie envoyer les candidatures ? (120s)`).catch(()=>{});
                        const collector = msg.channel.createMessageCollector({ filter, time: 120_000, max: 10 });

                        var category = null;
                        collector.on('collect', async m => { 
                            if (m.content == null) return msg.reply(messages.InvalidCategory).catch(()=>{});
                            var categoryId = m.content.replace('<', '').replace('>', '').replace('#', '');
                            category = await m.guild.channels.fetch(categoryId).catch(()=>{});

                            if (category == null) return msg.reply(messages.InvalidCategory).catch(()=>{});
                            if (category.type != "GUILD_CATEGORY") return msg.reply(messages.InvalidCategory).catch(()=>{});

                            msg.reply(`Catégorie choisie : \`${category.name}\``).catch(()=>{});
                            visedCategory = category;
                            collector.stop();
                        });

                        collector.on('end', async m => { 
                            if (collected.size == 0 || category == null) return msg.reply(messages.Expire).catch(()=>{});
                           
                            // QUESTIONS 
                            msg.reply(`Entrez une part une les questions a poser lors de la candidature (240s). Tapez \`stop\` pour enregistrer les questions. MAX : 99`).catch(()=>{});

                            var questions = [];
                    
                            const collector = msg.channel.createMessageCollector({ filter, time: 240000, max: 99 });
                            collector.on('collect', m => { 
                                if (m.content.toLowerCase() == 'stop') return collector.stop();
                                questions.push(m.content);
                                m.reply('Ajouté! Total: ' + questions.length).catch(()=>{});
                            });

                            collector.on('end', async collected => {
                                if (collected.size == 0) return msg.reply(messages.Expire).catch(()=>{});
                                if (questions.length == 0) return msg.reply("Les questions sont manquantes.").catch(()=>{});
                                
                                candidature_gestion.push({
                                    poste: poste,
                                    questions: questions,
                                    idMessageChannel: visedChannel.id,
                                    idCategoryCandidsResponses: visedCategory.id,
                                    message: msgContent
                                });

                                fs.writeFileSync(dir_candidature_gestion, JSON.stringify(candidature_gestion));
                                msg.reply("Le formulaire a bien été créé.").catch(()=>{});

                                const recapEmbed = new MessageEmbed();
                                recapEmbed.setTitle('Formulaire');
                                recapEmbed.setColor('DARKER_GREY');
                                recapEmbed.setDescription(`Récapitulation du formulaire créé, pour plus d'infos sur ce dernier : \`${config.prefix}candidature show ${poste}\``);
                                recapEmbed.addField(`Poste`, poste, true);
                                recapEmbed.addField(`Salon`, `<#${visedChannel.id}>`, true);
                                recapEmbed.addField(`Catégorie des candidatures`, `<#${visedCategory.id}>`, true);
                                recapEmbed.addField(`Nombre de questions`, questions.length.toString(), false);
                                recapEmbed.addField(`Message`, msgContent, false);
                                msg.reply({content:"Le formulaire a bien été créé.", embeds:[recapEmbed]}).catch(()=>{});

                                const row = new MessageActionRow()
                                row.addComponents(
                                    new MessageButton()
                                        .setCustomId('candidature;'+poste)
                                        .setLabel('POSTULER')
                                        .setStyle('SUCCESS'),
                                );
                                channel.send({content: msgContent, components: [row]});
                            });
                        });
                    });
                });
            });
            break;
        case "show":
            var listCandidatures = candidature_gestion.flatMap(c=>c.poste);
            var cibledCandid = candidature_gestion.find(c=>c.poste==poste);
            if (!cibledCandid) return msg.reply(messages.CandidatureNoExistFromList.replace('${args}', listCandidatures.join(', '))).catch(()=>{}); 

            const showCandidEmbed = new MessageEmbed();
            showCandidEmbed.setTitle('Formulaire');
            showCandidEmbed.setColor('DARKER_GREY');
            showCandidEmbed.setDescription(`Récapitulation du formulaire créé, pour plus d'infos sur ce dernier : \`${config.prefix}candidature show ${poste}\``);
            showCandidEmbed.addField(`Poste`, poste, true);
            showCandidEmbed.addField(`Salon`, `<#${cibledCandid.idMessageChannel}>`, true);
            showCandidEmbed.addField(`Catégorie des candidatures`, `<#${cibledCandid.idCategoryCandidsResponses}>`, true);
            showCandidEmbed.addField(`Nombre de questions`, cibledCandid.questions.length.toString(), false);
            showCandidEmbed.addField(`Message`, cibledCandid.message, false);
            msg.reply({content:`Voici la candidature pour le poste \`${poste}\``, embeds:[showCandidEmbed]}).catch(()=>{});
            var listQuestions = 'Liste des questions :';
            cibledCandid.questions.forEach(q=>{
                if (listQuestions.length + q.length > 1900) {
                    msg.reply(listQuestions).catch(()=>{});
                    listQuestions = '';
                }
                listQuestions += "\n`"+q+"`";
            });
            if (listQuestions.length > 0) msg.reply(listQuestions).catch(()=>{});
            break;
        case "edit":
            var listCandidatures = candidature_gestion.flatMap(c=>c.poste);
            var cibledCandid = candidature_gestion.find(c=>c.poste==poste);
            if (!cibledCandid) return msg.reply(messages.CandidatureNoExistFromList.replace('${args}', listCandidatures.join(', '))).catch(()=>{}); 
            var indexCandid = candidature_gestion.indexOf(cibledCandid);
            var editcmdList = ["addquestion", "removequestion", "changechannel", "changemessage", "changecategory", "delete"];
            if (!editcmd || !editcmdList.includes(editcmd)) return msg.reply(messages.MissingArgsFromList.replace('${arg}', 'cmd').replace('${args}', editcmdList.join(', ')).replace('${template}', template + " [cmd]")).catch(()=>{});

            switch (editcmd) {
                case "addquestion":
                    msg.reply("Entrez la question à ajouter : (60s)").catch(()=>{});
                    const collectorAddQ = msg.channel.createMessageCollector({ filter, time: 60_000, max: 1 });
                    collectorAddQ.on('collect', m => { 
                        cibledCandid.questions.push(m.content);
                    });

                    collectorAddQ.on('end', async collected => {
                        if (collected.size == 0) return msg.reply(messages.Expire).catch(()=>{});
                        fs.writeFileSync(dir_candidature_gestion, JSON.stringify(candidature_gestion));
                        msg.reply("Le formulaire a bien été modifié.").catch(()=>{});
                    });
                    break;
                case "removequestion":
                    if (cibledCandid.questions.length <= 1) return msg.reply(`La candidature doit au minimum avoir une question.`).catch(()=>{});
                    msg.reply("Entrez la question à retirer : (120s)").catch(()=>{});
                    const collectorRemoveQ = msg.channel.createMessageCollector({ filter, time: 60_000, max: 99 });
                    collectorRemoveQ.on('collect', async m => { 
                        var index = cibledCandid.questions.indexOf(m.content);
                        if (index < 0) return msg.reply("Question introuvable.").catch(()=>{});
                        cibledCandid.questions.splice(index, 1);
                        fs.writeFileSync(dir_candidature_gestion, JSON.stringify(candidature_gestion));
                        collectorRemoveQ.stop();
                    });

                    collectorRemoveQ.on('end', async collected => {
                        if (collected.size == 0) return msg.reply(messages.Expire).catch(()=>{});
                        msg.reply("Le formulaire a bien été modifié.").catch(()=>{});
                    });
                    break;
                case "changechannel":
                    msg.reply("Entrez le nouveau channel : (120s)").catch(()=>{});
                    const collectorChangeChan = msg.channel.createMessageCollector({ filter, time: 120_000, max: 99 });

                    var channel = null;
                    collectorChangeChan.on('collect', async m => { 
                        if (m.content == null) return msg.reply(messages.InvalidChannel).catch(()=>{});
                        var channelId = m.content.replace('<', '').replace('>', '').replace('#', '');
                        channel = await m.guild.channels.fetch(channelId).catch(()=>{});

                        if (channel == null) return msg.reply(messages.InvalidChannel).catch(()=>{});
                        if (channel.type != "GUILD_TEXT") return msg.reply(messages.InvalidChannel).catch(()=>{});

                        cibledCandid.idMessageChannel = channelId;
                        fs.writeFileSync(dir_candidature_gestion, JSON.stringify(candidature_gestion));
                        collectorChangeChan.stop();
                    });
                    
                    collectorChangeChan.on('end', async collected => { 
                        if (collected.size == 0 || channel == null) return msg.reply(messages.Expire).catch(()=>{});
                        msg.reply(`Salon choisi : \`${channel.name}\``).catch(()=>{});
                    });
                    break;

                case "changecategory":
                    msg.reply("Entrez l'id de la nouvelle category : (120s)").catch(()=>{});
                    const collectorChangeCat = msg.channel.createMessageCollector({ filter, time: 120_000, max: 99 });

                    var category = null;
                    collectorChangeCat.on('collect', async m => { 
                        if (m.content == null) return msg.reply(messages.InvalidCategory).catch(()=>{});
                        var categoryId = m.content.replace('<', '').replace('>', '').replace('#', '');
                        category = await m.guild.channels.fetch(categoryId).catch(()=>{});

                        if (category == null) return msg.reply(messages.InvalidCategory).catch(()=>{});
                        if (category.type != "GUILD_CATEGORY") return msg.reply(messages.InvalidCategory).catch(()=>{});

                        cibledCandid.idCategoryCandidsResponses = categoryId;
                        fs.writeFileSync(dir_candidature_gestion, JSON.stringify(candidature_gestion));
                        collectorChangeCat.stop();
                    });
                    
                    collectorChangeCat.on('end', async collected => { 
                        if (collected.size == 0 || category == null) return msg.reply(messages.Expire).catch(()=>{});
                        msg.reply(`Catégorie choisie : \`${category.name}\``).catch(()=>{});
                    });
                    break;
                case "changemessage":
                    msg.reply("Entrez le nouveau message de recrutement : (240s)").catch(()=>{});
                    const collectorChangeMsg = msg.channel.createMessageCollector({ filter, time: 240_000, max: 1 });

                    collectorChangeMsg.on('collect', async m => { 
                        if (m.content == null) return msg.reply(messages.Expire).catch(()=>{});

                        cibledCandid.message = m.content;
                        fs.writeFileSync(dir_candidature_gestion, JSON.stringify(candidature_gestion));
                        collectorChangeMsg.stop();
                    });
                    
                    collectorChangeMsg.on('end', async collected => { 
                        if (collected.size == 0 || cibledCandid.message == null) return msg.reply(messages.Expire).catch(()=>{});
                        msg.reply(`Message changé : \`${cibledCandid.message}\``).catch(()=>{});

                        var channel = await msg.guild.channels.fetch(cibledCandid.idMessageChannel);
                        const row = new MessageActionRow();
                        row.addComponents(
                            new MessageButton()
                                .setCustomId('candidature;'+cibledCandid.poste)
                                .setLabel('POSTULER')
                                .setStyle('SUCCESS'),
                        );
                        channel.send({content: cibledCandid.message, components: [row]});
                    });
                    break;
                case "delete":
                    msg.reply("Entrez `CONFIRMER` pour confirmer cette action (30s)").catch(()=>{});
                    const collectorDelete = msg.channel.createMessageCollector({ filter, time: 30_000, max: 1 });

                    collectorDelete.on('collect', async m => { 
                        if (m.content != 'CONFIRMER') return;
                        candidature_gestion.splice(indexCandid, 1);
                        fs.writeFileSync(dir_candidature_gestion, JSON.stringify(candidature_gestion));
                        collectorDelete.stop();
                    });
                    
                    collectorDelete.on('end', async collected => { 
                        if (collected.size == 0 || collected.first().content != 'CONFIRMER') return msg.reply(messages.Expire).catch(()=>{});
                        msg.reply(`Candidature supprimée!`).catch(()=>{});
                    });
                    break;
            }
            break;
        case "list":
            var listCandidatures = candidature_gestion.flatMap(c=>c.poste);
            msg.reply("Liste : `" + listCandidatures.join('`, `') + "`").catch(()=>{});
            break;
    }
}