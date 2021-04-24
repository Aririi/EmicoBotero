'use strict';

const { readdirSync } = require('fs');
const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client({
	ws: {
		intents: [ 'GUILD_MEMBERS', Discord.Intents.NON_PRIVILEGED ],
	},
});
client.commands = new Discord.Collection();

for (const file of readdirSync('./commands').filter(_file => _file.endsWith('.js'))) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

for (const file of readdirSync('./events').filter(_file => _file.endsWith('.js'))) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args), client);
	}
}

client.login(process.env.DISCORD_TOKEN);
