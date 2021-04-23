'use strict';

const fs = require('fs');
const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();

// commands collection
client.commands = new Discord.Collection();
for (const file of fs.readdirSync('./commands').filter(_file => _file.endsWith('.js'))) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

for (const file of fs.readdirSync('./events').filter(_file => _file.endsWith('.js'))) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name,(...args) => event.execute(...args, client));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args), client);
	}
}


client.login(process.env.DISCORD_TOKEN);
