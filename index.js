'use strict';

const fs = require('fs');
const Discord = require('discord.js');
const { prefix, admin } = require('./config.json');
require('dotenv').config();

const client = new Discord.Client();

// commands collection
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

for (const file of fs.readdirSync('./events').filter(_file => _file.endsWith('.js'))) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args), client);
	}
}

// when the client is ready, run this code
client.once('ready', () => {
	console.log(`User Tag: ${client.user.tag}\nUser ID: ${client.user.id}\n${client.user.username} is ready.`);
	// client.scripts.get('randomstatus').execute(client); client.scripts.get('reminder').execute(client, timeDB);
	client.user.setStatus('online');
});


// command section
client.on('message', message => {
	console.log(`[${message.author.tag}: ${message.cleanContent}]`);

	// help function when mentioned and asked 'help'
	if (message.content.includes(client.user.id) && message.content.includes('help')) {client.commands.get('help').execute(message);}

	// checks if contains bot's prefix and executes accordingly
	// splits off prefix and makes following text into lowercase
	if (message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).split(' ');
		const commandName = args.shift().toLowerCase();
		console.log(args, commandName);
		// finds command and aliases from list
		const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (!command) return message.channel.send('That\'s not a command I recognize.').then(sentMessage => sentMessage.delete({ timeout: 5000 }));
		if (message.author.bot) return;

		// checks if command is server-only via command property
		if (command.guildOnly && message.channel.type !== 'text') {return message.reply('Sorry, that\'s a server only command.');}
		// checks if command is locked to dev use
		if (message.author.id != admin && command.devOnly == true) {return message.reply('you do not have permission to execute this command (devOnly).'); }

		// looks for arguments if needed
		if (command.args && !args.length) {
			let reply = `${message.author.username}: You didn't provide any arguments.`;
			// provides proper usage
			if (command.usage) {reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;}
			return message.channel.send(reply);
		}

		// cooldown timer for command usage (anti-spam)
		if (!cooldowns.has(command.name)) {cooldowns.set(command.name, new Discord.Collection());}
		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;
		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.reply(`${message.author.username}: Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
					.then(sentMessage => sentMessage.delete({ timeout: (timeLeft + 1) * 1000 }));
			}
		}
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {command.execute(message, args, client);}
		catch (error) {console.error(error); message.channel.send('There was an error trying to execute that command.');}

	}
});


client.login(process.env.DISCORD_TOKEN);
