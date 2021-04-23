const Discord = require('discord.js');
const { prefix, name, repoURL, color3 } = require('../config.json');
let size;

module.exports = {
	name: 'server',
	description: 'Displays information on the current guild/server.',
	guildOnly: true,
	aliases: ['guild'],
	execute(message) {
		const guild = message.guild;
		// if a guild >250 members, its classified as 'large'
		if (guild.large != true) {size = 'Small';}
		else {size = 'Large';}

		const ServerInfo = new Discord.MessageEmbed()
			.setAuthor(`${name}'s Server Info`, 'attachment://icon64.png', repoURL)
			.attachFiles(['./icons/icon64.png'])
			.setColor(color3)
			.setTitle(guild.name)
			.setThumbnail(`${guild.iconURL({ dynamic: true })}?size=2048`)
			.addFields(
				{ name: 'Owner:', value: guild.owner, inline: false },
				{ name: 'Region:', value: guild.region, inline: true },
				{ name: 'ID:', value: guild.id, inline: true },
				{ name: `${name}'s prefix in this server: \`${prefix}\``, value: '\u200B', inline: false },

				{ name: 'Member count:', value: `${guild.memberCount} (${size})`, inline: true },
				{ name: 'Emoji count:', value: guild.emojis.cache.size, inline: true },
				{ name: 'Role count:', value: guild.roles.cache.size, inline: true },
				{ name: `Nitro Premium Tier ${guild.premiumTier}`, value: `from ${guild.premiumSubscriptionCount} boosters`, inline: false },
			)
			.setTimestamp()
			.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);
		message.channel.send(ServerInfo);
	},
};
