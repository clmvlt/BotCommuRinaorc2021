const { Client, Intents } = require('discord.js');

const config = require('./data/config.json');
const messages = require('./data/messages.json');

const intents = ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_PRESENCES", "GUILD_MESSAGE_REACTIONS", "GUILD_EMOJIS_AND_STICKERS"]
const client = new Client({
    ws: { intents: intents },
    intents: intents 
});

const discordModals = require('discord-modals');
discordModals(client);

var isRCON = false;

client.on('ready', async () =>{
    console.log('---------------------------------');
    console.log('Connecté : ' + client.user.tag);
    console.log('---------------------------------');
    client.user.setActivity(config.prefix+"help | play.rinaorc.com", {type: 'WATCHING'});
});

client.on('messageCreate', async (msg) =>{
    if (msg.author.bot) return;
    if (msg.channel.type == "DM") return;
    if (msg.guild.id != config.guildId && msg.guild.id != config.guildDevId) return;
    let args = msg.content.split(' ');
    let cmd = args[0].substring(1, args[0].length);
    
    switch (cmd) {
        case "ping":
            var s = Date.now();
            msg.reply('Pong!').then(m=>{
                m.edit("Pong! bot:`" + (Date.now() - s) + "ms` api:`"+client.ws.ping+"ms`");
            }).catch(()=>{});
            break;
        case "creation_team_msg":
            require('./commands/teams/creation_team_msg.js')(msg);
            break;
        case "candidature":
            require('./commands/others/gestion_candidatures.js')(msg);
            break;
        case "test":
            require('./commands/others/test.js')(msg);
            break;
        case "mdt":
            require('./commands/others/mdt.js')(msg);
            break;
        case "rcoff":
            if (!msg.member.roles.cache.has(config.botRoleId) && !msg.member.roles.cache.has(config.leaderRoleId)) return msg.reply(messages.MissingPerms).catch(()=>{});
            msg.reply(messages.RCTurnedOff).catch(()=>{});
            isRCON = false;
            break;
        case "rcon":
            if (!msg.member.roles.cache.has(config.botRoleId) && !msg.member.roles.cache.has(config.leaderRoleId)) return msg.reply(messages.MissingPerms).catch(()=>{});
            msg.reply(messages.RCTurnedOn).catch(()=>{});
            isRCON = true;
            break;
    }
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
    if (interaction.guild.id != config.guildId && interaction.guild.id != config.guildDevId) return;

	const { commandName } = interaction;

	switch (commandName) {
		case "info":
            await require('./commands/rinaorc/info.js')(interaction);
            break;
        case "stats":
            await require('./commands/rinaorc/stats.js')(interaction);
            break;
        case "leaderboards":
            await require('./commands/rinaorc/leaderboards.js')(interaction);
            break;
        case "link":
            await require('./commands/rinaorc/link.js')(interaction);
            break;
        case "unlink":
            await require('./commands/rinaorc/unlink.js')(interaction);
            break;
        case "team":
            await require('./commands/teams/team.js')(interaction);
            break;
        case "leave":
            await require('./commands/teams/leave.js')(interaction);
            break;
        case "kick":
            await require('./commands/teams/kick.js')(interaction);
            break;
        case "invite":
            if (!isRCON) return interaction.reply({content: messages.RCAreOff, ephemeral: true}).catch(()=>{});
            await require('./commands/teams/invite.js')(interaction);
            break;
        case "message":
            if (!interaction.member.roles.cache.has(config.leaderRoleId) && !interaction.member.roles.cache.has(config.botRoleId)) return interaction.reply({
                ephemeral: true,
                content: messages.MissingPerms
            }).catch(()=>{});
            await require('./commands/others/message.js')(interaction, client);
            break;
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	const { customId } = interaction;

    interaction.deferUpdate();
    if (interaction.customId.startsWith('candidature')) {
        require('./interactions/candidatures.js')(interaction);
        return;
    }

    if (!isRCON) return interaction.reply({content: messages.RCAreOff, ephemeral: true}).catch(()=>{});
    if (customId.startsWith('btnRejoindre')) {
        require('./interactions/joinTeam.js')(interaction);
        return;
    } else if (customId.startsWith('btnDisband')) {
        require('./interactions/disbandTeam.js')(interaction);
        return;
    } else if (customId.startsWith('btnRefuse')) {
        require('./interactions/refuse.js')(interaction);
        return;
    } else if (customId.startsWith('btnAnnulJoin')) {
        require('./interactions/annule.js')(interaction);
        return;
    } else if (customId.startsWith('btnAccept')) {
        require('./interactions/accept.js')(interaction);
        return;
    }


	switch (customId) {
		case "btnCreateTeam":
            require('./interactions/create_team.js')(interaction, client);
            break;
	}
});

client.on('modalSubmit', (modal) => {
    if (modal.customId === 'formMessage'){
        require('./interactions/modalMessage.js')(modal, client)
    } 

    if (!isRCON) return modal.followUp({content: messages.RCAreOff, ephemeral: true}).catch(()=>{});
    if(modal.customId === 'fromCreateTeam'){
        require('./interactions/modalCreationTeam.js')(modal, client)
    }
})

client.on('guildMemberAdd', (member)=>{
    require('./events/guildMemberAdd.js')(member);
})

client.on('guildMemberRemove', (member)=>{
    require('./events/guildMemberRemove.js')(member);
});

client.login(config.token);