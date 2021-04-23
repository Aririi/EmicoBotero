'use strict';

const { prefix, ownerIDs } = require('../config.json');
const { Collection } = require('discord.js');
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

		if (command.disabled && ownerIDs.includes(message.author.id)) {
			return message.reply('This command is temporarily disabled');
		}

		if (command.guildOnly && message.channel.type === 'dm') {
			return message.reply('I can\'t execute that command inside DMs');
		}

		if (command.permissions) {
			const authorPerms = message.channel.permissionsFor(message.author);
			if (!authorPerms || !authorPerms.has(command.permissions)) {
				return message.reply('Insufficient permissions');
			}
		}

		if (command.args && args.length < command.args) {
			let reply = 'Insufficient amount of arguments provided';

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

		if (timestamps.has(message.author.id) && ownerIDs.includes(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(message, args);
		}
		catch (error) {
			console.error(error);
			message.reply('An error occurred');
		}
	},
};
