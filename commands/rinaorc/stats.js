const { MessageEmbed, Message, Interaction, CommandInteraction } = require('discord.js');
const msToHms = require('ms-to-hms');
const messages = require('./../../data/messages.json');

/**
 * 
 * @param {CommandInteraction<CacheType>} it
 */
module.exports = async function (it) {
    const api = new (require('./../../api/connect.js'));

    var pseudo = it.options.get('pseudo').value;
    if (pseudo != null) {
        pseudo = pseudo.replace(' ', '');
    }
    var infos = await api.getPlayer(pseudo);
    var indexPage = 0;
    var pages = [];
    var libelles = {
        "level": "Levels",
        "experience": "Exprérience",
        "winStreak": "WinStreak",
        "currentWinStreak": "WinStreak",
        "ks": "KillStreak",
        "bestWinStreak": "Meilleur WinStreak",
        "bestKs": "Meilleur KillStreak",
        "elo1": "Elo 1",
        "elo2": "Elo 2",
        "bestElo1": "Meilleur Elo 1",
        "bestElo2": "Meilleur Elo 2",
        "prestige": "Prestige",
        "kills": "Kills",
        "deaths": "Morts",
        "islandLevel": "Niveau d'île",
        "timePlayed": "Temps de jeu",
        "killsWeek": "Kills cette semaine",
        "mobs": "Nombre de mobs"
    }
    var libellesGM = {
        "bedwars":"BedWars",
        "pixelperfect":"Pixel Perfect",
        "sheepwars":"SheepWars",
        "golemrush":"Golem Rush",
        "uhc":"UHC Games",
        "skywars":"SkyWars",
        "thepurge":"The Purge",
        "pvpbox":"PvP Box",
        "pvpenchants":"PvP Enchants",
        "skyblock":"SkyBlock"
    }

    if (!infos.success) return it.reply({
        content: messages.InvalidPseudo,
        ephemeral: true
    });

    var gamemode = it.options.get('mode_de_jeu')?.value;

    switch (gamemode) {
        case null:
        default:
            var g = infos.player.games, gamemodesKeys = Object.keys(g);
            gamemodesKeys.forEach(key=>{
                if (g[key] == null) return;

                var selectGamemode = g[key];
                var selectGamemodeKeys = Object.keys(selectGamemode);

                var Embed = new MessageEmbed();
                Embed.setTitle(`✨ ${infos.player.name} - ${libellesGM[key] ? libellesGM[key] : selectGamemode} ✨`);
                Embed.setFooter({
                    text: messages.EmbedsFooter,
                    iconURL: it.guild.iconURL()
                });
                Embed.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`);
                Embed.setColor('YELLOW');

                selectGamemodeKeys.forEach(gamemodeKey=>{
                    var value = selectGamemode[gamemodeKey];
                    Embed.addField(
                        libelles[gamemodeKey] ? libelles[gamemodeKey] : gamemodeKey,
                        `\`${gamemodeKey.startsWith('time') ? msToHms(value).split(':')[0] + "h" + msToHms(value).split(':')[1] + "s" : value}\``,
                        true
                    )

                })

                pages.push(Embed);
            })

            break;
        case "bedwars":
            var g = infos.player.games.bedwars, s = infos.player.stats.bedwars;

            const EmbedGame = new MessageEmbed();
            EmbedGame.setTitle('🛏️ ' + infos.player.name + ' - Bedwars Expérience 🛏️')
            EmbedGame.setColor('YELLOW');
            EmbedGame.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
            EmbedGame.setFooter({
                text: messages.EmbedsFooter,
                iconURL: it.guild.iconURL()
            });
            EmbedGame.addFields(
                {
                    name: "Levels", value: g.level + ` \`(${g.experience}xp)\``, inline: true
                },
                {
                    name: "WinStreak", value: g.winStreak + ` \`(Best : ${g.bestWinStreak})\``, inline: true
                }
            )
            pages.push(EmbedGame);

            var keys = Object.keys(s);
            var libellesKeys = {
                "kills": "Kills",
                "lostBed": "Lits perdus",
                "breakBed": "Lits détruits",
                "deaths": "Morts",
                "finalKills": "Finals Kills",
                "wins": "Victoires",
                "played": "Parties jouées",
                "finalDeaths": "Défaites"
            }
            keys.forEach(key=>{
                const EmbedTemp = new MessageEmbed();
                EmbedTemp.setTitle('🛏️ ' + infos.player.name + ' - Bedwars ' + libellesKeys[key] + ' 🛏️')
                EmbedTemp.setColor('YELLOW');
                EmbedTemp.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
                EmbedTemp.setFooter({
                    text: messages.EmbedsFooter,
                    iconURL: it.guild.iconURL()
                });
                EmbedTemp.addFields(
                    {
                        name: "Solo", value: `Total : \`${s[key].total.solo}\`\nCe-mois ci : \`${s[key].month.solo}\`\nCette semaine : \`${s[key].week.solo}\``, inline: true
                    },
                    {
                        name: "Duo", value: `Total : \`${s[key].total.duo}\`\nCe-mois ci : \`${s[key].month.duo}\`\nCette semaine : \`${s[key].week.duo}\``, inline: true
                    },
                    {
                        name: "Trio", value: `Total : \`${s[key].total.trio}\`\nCe-mois ci : \`${s[key].month.trio}\`\nCette semaine : \`${s[key].week.trio}\``, inline: true
                    },
                    {
                        name: "Quatuor", value: `Total : \`${s[key].total.quatuor}\`\nCe-mois ci : \`${s[key].month.quatuor}\`\nCette semaine : \`${s[key].week.quatuor}\``, inline: true
                    },
                    {
                        name: "Total", value: `Total : \`${s[key].total.all}\`\nCe-mois ci : \`${s[key].month.all}\`\nCette semaine : \`${s[key].week.all}\``, inline: true
                    }
                )
                pages.push(EmbedTemp);
            })
            break;

        case "golemrush":
            var g = infos.player.games.golemrush;

            const EmbedGameGR = new MessageEmbed();
            EmbedGameGR.setTitle('🦾 ' + infos.player.name + ' - Golem Rush Expérience 🦾')
            EmbedGameGR.setColor('YELLOW');
            EmbedGameGR.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
            EmbedGameGR.setFooter({
                text: messages.EmbedsFooter,
                iconURL: it.guild.iconURL()
            });
            EmbedGameGR.addFields(
                {
                    name: "Levels", value: g.level + ` \`(${g.experience}xp)\``, inline: true
                }
            )
            pages.push(EmbedGameGR);
            break;
        case "practice":
            var s = infos.player.stats.practice;

            var keys = Object.keys(s);
            var libellesKeys = {
                "deaths": "Morts",
                "wins": "Victoires",
                "played": "Parties jouées"
            }
            keys.forEach(key=>{
                const EmbedTemp = new MessageEmbed();
                EmbedTemp.setTitle('⚔️ ' + infos.player.name + ' - Practice ' + libellesKeys[key] + ' ⚔️')
                EmbedTemp.setColor('YELLOW');
                EmbedTemp.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
                EmbedTemp.setFooter({
                    text: messages.EmbedsFooter,
                    iconURL: it.guild.iconURL()
                });
                EmbedTemp.addFields(
                    {
                        name: "No Debuff", value: `Total : \`${s[key].total.noDebuff}\`\nCe-mois ci : \`${s[key].month.noDebuff}\`\nCette semaine : \`${s[key].week.noDebuff}\``, inline: true
                    },
                    {
                        name: "Sumo", value: `Total : \`${s[key].total.sumo}\`\nCe-mois ci : \`${s[key].month.sumo}\`\nCette semaine : \`${s[key].week.sumo}\``, inline: true
                    },
                    {
                        name: "HCF", value: `Total : \`${s[key].total.hcf}\`\nCe-mois ci : \`${s[key].month.hcf}\`\nCette semaine : \`${s[key].week.hcf}\``, inline: true
                    },
                    {
                        name: "Build UHC", value: `Total : \`${s[key].total.buildUhc}\`\nCe-mois ci : \`${s[key].month.buildUhc}\`\nCette semaine : \`${s[key].week.buildUhc}\``, inline: true
                    },
                    {
                        name: "Boxing", value: `Total : \`${s[key].total.boxing}\`\nCe-mois ci : \`${s[key].month.boxing}\`\nCette semaine : \`${s[key].week.boxing}\``, inline: true
                    }
                )
                pages.push(EmbedTemp);
            })
            break;
        case "thepurge":
            var g = infos.player.games.thepurge, s = infos.player.stats.thepurge;

            const EmbedGameTP = new MessageEmbed();
            EmbedGameTP.setTitle('🔪 ' + infos.player.name + ' - ThePurge Expérience 🔪')
            EmbedGameTP.setColor('YELLOW');
            EmbedGameTP.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
            EmbedGameTP.setFooter({
                text: messages.EmbedsFooter,
                iconURL: it.guild.iconURL()
            });
            EmbedGameTP.addFields(
                {
                    name: "Levels", value: g.level + ` \`(${g.experience}xp)\``, inline: true
                },
                {
                    name: "Prestige", value: `\`${g.prestige}\``, inline: true
                }
            )
            pages.push(EmbedGameTP);
            
            var keys = Object.keys(s);
            var libellesKeys = {
                "kills": "Kills",
                "deaths": "Morts",
                "experience": "Expérience",
                "gold": "Or"
            }
            keys.forEach(key=>{
                const EmbedTemp = new MessageEmbed();
                EmbedTemp.setTitle('🔪 ' + infos.player.name + ' - ThePurge ' + libellesKeys[key] + ' 🔪')
                EmbedTemp.setColor('YELLOW');
                EmbedTemp.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
                EmbedTemp.setFooter({
                    text: messages.EmbedsFooter,
                    iconURL: it.guild.iconURL()
                });
                EmbedTemp.addFields(
                    {
                        name: "Total", value: `\`${s[key].total}\``, inline: true
                    },
                    {
                        name: "Ce mois-ci", value: `\`${s[key].month}\``, inline: true
                    },
                    {
                        name: "Cette semaine", value: `\`${s[key].week}\``, inline: true
                    }
                )
                pages.push(EmbedTemp);
            })
            break;
        case "skywars":
            var g = infos.player.games.skywars, s = infos.player.stats.skywars;

            const EmbedGameSW = new MessageEmbed();
            EmbedGameSW.setTitle('🌎 ' + infos.player.name + ' - SkyWars Expérience 🌎')
            EmbedGameSW.setColor('YELLOW');
            EmbedGameSW.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
            EmbedGameSW.setFooter({
                text: messages.EmbedsFooter,
                iconURL: it.guild.iconURL()
            });
            EmbedGameSW.addFields(
                {
                    name: "Levels", value: g.level + ` \`(${g.experience}xp)\``, inline: true
                },
                {
                    name: "Prestige", value: `\`${g.prestige}\``, inline: true
                },
                {
                    name: "WinStreak", value: g.winStreak + ` \`(Best : ${g.bestWinStreak})\``, inline: true
                }
            )
            pages.push(EmbedGameSW);
            
            var keys = Object.keys(s);
            var libellesKeys = {
                "kills": "Kills",
                "played": "Parties jouées",
                "looses": "Défaites",
                "playedTime": "Temps de jeu",
                "deaths": "Morts",
                "assists": "Assitances",
                "arrowShots": "Tirs de flèches",
                "chestsOpened": "Coffres ouverts",
                "goulag": "Goulag",
                "goulagWin": "Victoires en Goulag",
            }
            keys.forEach(key=>{
                const EmbedTemp = new MessageEmbed();
                EmbedTemp.setTitle('🌎 ' + infos.player.name + ' - SkyWars ' + libellesKeys[key] + ' 🌎')
                EmbedTemp.setColor('YELLOW');
                EmbedTemp.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
                EmbedTemp.setFooter({
                    text: messages.EmbedsFooter,
                    iconURL: it.guild.iconURL()
                });
                EmbedTemp.addFields(
                    {
                        name: "Total", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].total.all).split(':')[0] + "h" + msToHms(s[key].total.all).split(':')[1] + 'm' : s[key].total.all}\`\nDuo : \`${key.endsWith('Time') ? msToHms(s[key].total.duo).split(':')[0] + "h" + msToHms(s[key].total.duo).split(':')[1] + 'm' : s[key].total.duo}\``, inline: true
                    },
                    {
                        name: "Ce mois-ci", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].month.all).split(':')[0] + "h" + msToHms(s[key].month.all).split(':')[1] + 'm' : s[key].month.all}\`\nDuo : \`${key.endsWith('Time') ? msToHms(s[key].month.duo).split(':')[0] + "h" + msToHms(s[key].month.duo).split(':')[1] + 'm' : s[key].month.duo}\``, inline: true
                    },
                    {
                        name: "Cette semaine", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].week.all).split(':')[0] + "h" + msToHms(s[key].week.all).split(':')[1] + 'm' : s[key].week.all}\`\nDuo : \`${key.endsWith('Time') ? msToHms(s[key].week.duo).split(':')[0] + "h" + msToHms(s[key].week.duo).split(':')[1] + 'm' : s[key].week.duo}\``, inline: true
                    }
                )
                pages.push(EmbedTemp);
            })
            break;
        case "pixelperfect":
            var g = infos.player.games.pixelperfect, s = infos.player.stats.pixelperfect;

            const EmbedGamePP = new MessageEmbed();
            EmbedGamePP.setTitle('🎇 ' + infos.player.name + ' - PixelPerfect Expérience 🎇')
            EmbedGamePP.setColor('YELLOW');
            EmbedGamePP.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
            EmbedGamePP.setFooter({
                text: messages.EmbedsFooter,
                iconURL: it.guild.iconURL()
            });
            EmbedGamePP.addFields(
                {
                    name: "Levels", value: g.level + ` \`(${g.experience}xp)\``, inline: true
                },
                {
                    name: "WinStreak", value: g.currentWinStreak + ` \`(Best : ${g.bestWinStreak})\``, inline: true
                }
            )
            pages.push(EmbedGamePP);
            
            var keys = Object.keys(s);
            var libellesKeys = {
                "played": "Parties jouées",
                "wins": "Wins"
            }
            keys.forEach(key=>{
                const EmbedTemp = new MessageEmbed();
                EmbedTemp.setTitle('🎇 ' + infos.player.name + ' - PixelPerfect ' + libellesKeys[key] + ' 🎇')
                EmbedTemp.setColor('YELLOW');
                EmbedTemp.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
                EmbedTemp.setFooter({
                    text: messages.EmbedsFooter,
                    iconURL: it.guild.iconURL()
                });
                EmbedTemp.addFields(
                    {
                        name: "Total", value: `Total : \`${ s[key].total}\``, inline: true
                    },
                    {
                        name: "Ce mois-ci", value: `Total : \`${ s[key].month}\``, inline: true
                    },
                    {
                        name: "Cette semaine", value: `Total : \`${ s[key].week}\``, inline: true
                    }
                )
                pages.push(EmbedTemp);
            })
            break;
        case "smash":
            var g = s = infos.player.stats.smash;


            var keys = Object.keys(s);
            var libellesKeys = {
                "played": "Parties jouées",
                "deaths": "Morts",
                "damageTaken": "Dégats reçus",
                "spellUsed": "Sorts utilisés",
                "kills": "Kills",
                "damageGiven": "Dégats infligés",
                "playedTime": "Temps de jeu"
            }
            keys.forEach(key=>{
                const EmbedTemp = new MessageEmbed();
                EmbedTemp.setTitle('🥇 ' + infos.player.name + ' - Smash ' + libellesKeys[key] + ' 🥇')
                EmbedTemp.setColor('YELLOW');
                EmbedTemp.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
                EmbedTemp.setFooter({
                    text: messages.EmbedsFooter,
                    iconURL: it.guild.iconURL()
                });
                EmbedTemp.addFields(
                    {
                        name: "Total", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].total.all).split(':')[0] + "h" + msToHms(s[key].total.all).split(':')[1] + 'm' : s[key].total.all}\`\nSolo : \`${key.endsWith('Time') ? msToHms(s[key].total.solo).split(':')[0] + "h" + msToHms(s[key].total.solo).split(':')[1] + 'm' : s[key].total.solo}\``, inline: true
                    },
                    {
                        name: "Ce mois-ci", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].month.all).split(':')[0] + "h" + msToHms(s[key].month.all).split(':')[1] + 'm' : s[key].month.all}\`\nSolo : \`${key.endsWith('Time') ? msToHms(s[key].month.solo).split(':')[0] + "h" + msToHms(s[key].month.solo).split(':')[1] + 'm' : s[key].month.solo}\``, inline: true
                    },
                    {
                        name: "Cette semaine", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].week.all).split(':')[0] + "h" + msToHms(s[key].week.all).split(':')[1] + 'm' : s[key].week.all}\`\nSolo : \`${key.endsWith('Time') ? msToHms(s[key].week.solo).split(':')[0] + "h" + msToHms(s[key].week.solo).split(':')[1] + 'm' : s[key].week.solo}\``, inline: true
                    }
                )
                pages.push(EmbedTemp);
            })
            break;
        case "ageOfSwords":
            var g = s = infos.player.stats.ageOfSwords;

            console.log(s)


            var keys = Object.keys(s);
            var libellesKeys = {
                "played": "Parties jouées",
                "deaths": "Morts",
                "kills": "Kills",
                "playedTime": "Temps de jeu"
            }
            keys.forEach(key=>{
                const EmbedTemp = new MessageEmbed();
                EmbedTemp.setTitle('🔍 ' + infos.player.name + ' - Age Of Swords ' + libellesKeys[key] + ' 🔍')
                EmbedTemp.setColor('YELLOW');
                EmbedTemp.setThumbnail(`https://minotar.net/helm/${infos.player.name}/100.png`)
                EmbedTemp.setFooter({
                    text: messages.EmbedsFooter,
                    iconURL: it.guild.iconURL()
                });
                EmbedTemp.addFields(
                    {
                        name: "Total", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].total.all).split(':')[0] + "h" + msToHms(s[key].total.all).split(':')[1] + 'm' : s[key].total.all}\`\nDuo : \`${key.endsWith('Time') ? msToHms(s[key].total.duo).split(':')[0] + "h" + msToHms(s[key].total.duo).split(':')[1] + 'm' : s[key].total.duo}\``, inline: true
                    },
                    {
                        name: "Ce mois-ci", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].month.all).split(':')[0] + "h" + msToHms(s[key].month.all).split(':')[1] + 'm' : s[key].month.all}\`\nDuo : \`${key.endsWith('Time') ? msToHms(s[key].month.duo).split(':')[0] + "h" + msToHms(s[key].month.duo).split(':')[1] + 'm' : s[key].month.duo}\``, inline: true
                    },
                    {
                        name: "Cette semaine", value: `Total : \`${key.endsWith('Time') ? msToHms(s[key].week.all).split(':')[0] + "h" + msToHms(s[key].week.all).split(':')[1] + 'm' : s[key].week.all}\`\nDuo : \`${key.endsWith('Time') ? msToHms(s[key].week.duo).split(':')[0] + "h" + msToHms(s[key].week.duo).split(':')[1] + 'm' : s[key].week.duo}\``, inline: true
                    }
                )
                pages.push(EmbedTemp);
            })
            break;
    }

    

    await it.reply({embeds:[pages[indexPage]]}).catch(()=>{
        it.reply({
            ephemeral: true,
            content: messages.Error
        }).catch(()=>{});
    });
    var m = await it.fetchReply().catch((e)=>{console.log(e)});
    m.react("⬅️").catch((e)=>{console.log(e)});
    m.react("➡️").catch((e)=>{console.log(e)});

    const collector = m.createReactionCollector({time: 5 * 60_000});

    collector.on('collect', async (reaction, user) => { 
        if (user.bot) return;

        switch (reaction.emoji.name) {
            case "⬅️":
                if (indexPage > 0) {
                    indexPage--;
                }  else {
                    indexPage = pages.length - 1;
                }
                break;
            case "➡️":
                if (indexPage >= pages.length - 1) {
                    indexPage = 0;
                }  else {
                    indexPage++;
                }
                break;
        }
        reaction.users.remove(user).catch((e)=>{console.log(e)});
        await it.editReply({embeds:[pages[indexPage]]}).catch(()=>{
            it.reply({
                ephemeral: true,
                content: messages.Error
            }).catch(()=>{});
        });
    });
}