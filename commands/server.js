'use strict';

const Discord = require('discord.js');
const { name, prefix, color1, repoURL } = require('../config.json');

module.exports = {
	name: 'server',
	description: 'Displays information of the server',
	guildOnly: true,
	aliases: [ 'guild' ],
	execute(message) {
		const serverInfo = new Discord.MessageEmbed()
			.setAuthor(`${name}'s Server Info`, 'attachment://icon64.png', repoURL)
			.attachFiles([ './icons/icon64.png' ])
			.setColor(color1)
			.setTitle(message.guild.name)
			.setThumbnail(`${message.guild.iconURL({ dynamic: true })}?size=2048`)
			.addFields(
				{ name: 'Owner:', value: message.guild.owner, inline: false },
				{ name: 'Region:', value: message.guild.region, inline: true },
				{ name: 'ID:', value: message.guild.id, inline: true },
				{ name: `${name}'s prefix in this server: \`${prefix}\``, value: '\u200B', inline: false },

				{ name: 'Member count:', value: `${message.guild.memberCount} (${message.guild.large ? 'Large' : 'Small'})`, inline: true },
				{ name: 'Emoji count:', value: message.guild.emojis.cache.size, inline: true },
				{ name: 'Role count:', value: message.guild.roles.cache.size, inline: true },
				{ name: `Nitro Premium Tier ${message.guild.premiumTier}`, value: `from ${message.guild.premiumSubscriptionCount} boosters`, inline: false },
			)
			.setTimestamp()
			.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);

		message.channel.send(serverInfo)
			.catch(console.error);
	},
};
