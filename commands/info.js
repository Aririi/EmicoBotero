const Discord = require('discord.js');
const { name, prefix, repoURL, color2 } = require('../config.json');
const alias = name.toLowerCase();

module.exports = {
	name: 'info',
	description: 'Shows bot info.',
	aliases: ['information', 'about', alias],
	execute(message) {
		// sends temp message while embed sends
		message.channel.send('Compiling matrices. Stand by...').then(sentMessage => {
			sentMessage.delete({ timeout: 1000 });
			const InfoEmbed = new Discord.MessageEmbed()
				.setColor(`${color2}`)
				.setTitle(`About ${name}`)
				.attachFiles(['./icons/icon400.png'])
				.setThumbnail('attachment://icon400.png')
				.setDescription(`
					A cooperative bot development effort for "Emico's Empty Bliss" on Discord using JavaScript.`)
				.addFields(
					{ name: 'Development Start Date:', value: 'April 23, 2021' },
					{ name: 'Contributors:', value: 'Ariri#7998, Non-Existant#9050, Klonade#6176, Space Gura#3571', inline: true },
					{ name: 'Help:', value: `\`${prefix}help\`` },
					{ name: `${name}'s prefix in this server: \`${prefix}\``, value: '\u200B', inline: false },
				)
				.setAuthor(name, 'attachment://icon400.png', repoURL)
				.setTimestamp()
				.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);

			message.channel.send(InfoEmbed);

		});
	},
};
