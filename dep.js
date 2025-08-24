/**
 * 
 * @param {string[]} teams 
 */
module.exports = function (teams) {
    const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v9');
    const { clientId, guildId, token, guildDevId } = require('./data/config.json');

    const commands = [
        new SlashCommandBuilder().setName('info').setDescription("Obtenir les informations d'un utilisateur avec son pseudo.").addStringOption(
            option => option.setName("pseudo").setDescription("Pseudo du joueur").setRequired(true)
        ),
        new SlashCommandBuilder().setName('message').setDescription("Envoyer un message en Embed.").setDefaultPermission(true),
        new SlashCommandBuilder().setName('leave').setDescription("Quitter votre team.").setDefaultPermission(true),
        new SlashCommandBuilder().setName('invite').setDescription("Inviter un joueur dans votre team").addUserOption(
            option => option.setName("discord").setDescription("Discord du joueur").setRequired(true)
        ),
        new SlashCommandBuilder().setName('kick').setDescription("Kicker un joueur dans votre team").addUserOption(
            option => option.setName("discord").setDescription("Discord du joueur").setRequired(true)
        ),
        new SlashCommandBuilder().setName('stats').setDescription("Obtenir les statistiques d'un joueur avec son pseudo.").addStringOption(
            option => option.setName("pseudo").setDescription("Pseudo du joueur").setRequired(true)
        ).addStringOption(option =>
            option.setName('mode_de_jeu')
                .setDescription('Choix du mode de jeu')
                .setRequired(false)
                .addChoices(
                    {
                        name: "🛌 BedWars", value: "bedwars"
                    },
                    {
                        name: "🦾 GolemRush", value: "golemrush"
                    },
                    {
                        name: "🏹 Practice", value: "practice"
                    },
                    {
                        name: "🔪 ThePurge", value: "thepurge"
                    },
                    {
                        name: "🌍 SkyWars", value: "skywars"
                    },
                    {
                        name: "🎇 Pixel Perfect", value: "pixelperfect"
                    },
                    {
                        name: "🥇 Smash", value: "smash"
                    },
                    {
                        name: "🔍 Age Of Swords", value: "ageOfSwords"
                    }
                )
        ),
        new SlashCommandBuilder().setName('leaderboards').setDescription("Liste des meilleurs joueurs du serveur."),
        new SlashCommandBuilder().setName('link').setDescription("Lier votre profil en jeu avec le serveur discord.").addStringOption(
            option => option.setName("pseudo").setDescription("Votre pseudo en jeu").setRequired(true)
        ),
        new SlashCommandBuilder().setName('unlink').setDescription("Délier votre profil en jeu avec le serveur discord."),
    ];
if (teams != null) {
    var so = new SlashCommandStringOption();
    so.setName('nom_team');
    so.setDescription('Nom de la team');
    so.setRequired(true);

    teams.forEach(team=>{
        so.addChoices({
            name: team,
            value: team.toLowerCase()
        })
    })

    var sCmdTeam = new SlashCommandBuilder().setName('team').setDescription("Obtenir les informations d'une team.").addStringOption(so);
    commands.push(sCmdTeam)
}
        commands.map(command => command.toJSON());

    const rest = new REST({ version: '9' }).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(() => console.log('Les commandes ont été sauvegardées avec succès.'))
        .catch(console.error)

    rest.put(Routes.applicationGuildCommands(clientId, guildDevId), { body: commands })
        .then(() => console.log('Les commandes ont été sauvegardées avec succès sur le serveur dev.'))
        .catch(console.error)
}