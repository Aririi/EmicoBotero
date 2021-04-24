'use strict';

const { name, color1, prefix, repoURL } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
	name: 'help',
	description: 'Lists all of my commands or info about a specific command.',
	aliases: [ 'commands' ],
	usage: '<command name>',
	cooldown: 5,
	execute(message, args) {
		const data = [];
		const { commands } = message.client;
		const HelpEmbed = new Discord.MessageEmbed()
			.setColor(color1)
			.setTitle(`${name}'s Commands:`)
			.attachFiles([ './icons/icon64.png' ])
			.addFields(
				{ name: `${name}'s current prefix: \`${prefix}\``, value: '\u200B', inline: false },
				{ name: 'Command List:', value: `\`${commands.map(command => command.name).join(', ')}\`` },
				{ name: 'How to get more information:', value: `\nYou can send \`${prefix}help [command name]\` to get info on a specific command.` },
			)
			.setAuthor(`${name} Matrix`, 'attachment://icon64.png', repoURL)
			.setTimestamp()
			.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);
		// checks if command was from dm and provides differently formatted reply
		if (args) {
			if (!args.length) {
				if (message.channel.type === 'dm') {
					return message.author.send(HelpEmbed);
				}
				return message.channel.send(HelpEmbed);
			}
		}
		else {
			return message.channel.send(HelpEmbed);
		}

		// looks for commands under the name of the first arg
		const cmdName = args[0].toLowerCase();
		const command = commands.get(cmdName) || commands.find(c => c.aliases && c.aliases.includes(cmdName));

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		data.push(`**Name:** ${command.cmdName}`);

		// provides info from the command if exists
		if (command.aliases) {
			data.push(`**Aliases:** \`${command.aliases.join(', ')}\``);
		}
		if (command.description) {
			data.push(`**Description:** ${command.description}`);
		}
		if (command.usage) {
			data.push(`**Usage:** \`${prefix}${command.cmdName} ${command.usage}\``);
		}

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		message.channel.send(data, { split: true });
	},
};
