'use strict';

const { Collection } = require('discord.js');
const { prefix, admins } = require('../config.json');
require('dotenv').config();

const cooldowns = new Collection();

module.exports = {
	name: 'message',
	execute(message) {
		if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) {
			return;
		}

		const args = message.content.slice(prefix.length).trim().split(/ +/gu);
		const commandName = args.shift().toLowerCase();

		const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) {
			return;
		}

		if (command.devOnly && !admins.includes(message.author.id)) {
			return message.channel.send(`${message.author.username}: This command can only be used by adminstrators.`);
		}

		if (command.disabled && !admins.includes(message.author.id)) {
			return message.channel.send(`${message.author.username}: This command is disabled.`);
		}

		if (command.guildOnly && message.channel.type === 'dm') {
			return message.channel.send(`${message.author.username}: This command is only usable in servers.`);
		}

		if (command.permissions) {
			const authorPerms = message.channel.permissionsFor(message.author);
			if (!authorPerms || !authorPerms.has(command.permissions)) {
				return message.channel.send(`${message.author.username}: You have insufficient permissions to use this command.`);
			}
		}

		if (!command) {
			return message.channel.send(`${message.author.username}: This is not a valid command.`).then(sentMessage => sentMessage.delete({ timeout: 3000 }));
		}

		if (command.args && args.length < command.args) {
			let reply = `${message.author.username}: You did not provide enough arguments.`;

			if (command.usage) {
				reply += `\nProper usage would be: \`${prefix}${commandName} ${command.usage}\``;
			}
			return message.channel.send(reply);
		}

		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.channel.send(`${message.author.username}: Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
					.then(sentMessage => sentMessage.delete({ timeout: (timeLeft + 1) * 1000 }));
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(message, args);
		}
		catch (error) {
			console.error(error);
			message.channel.send('an error has occurred.');
		}
	},
};
