'use strict';

const { MessageEmbed } = require('discord.js');
const { name, repoURL } = require('../config.json');

module.exports = {
	name: 'user',
	description: 'Displays user information of author or mentioned user',
	aliases: [ 'userinfo' ],
	usage: '<username/nickname>',
	execute(message, args) {
		// sets up stuff in embed that will always be the same
		const userInfo = new MessageEmbed()
			.attachFiles([ './icons/icon64.png' ])
			.setDescription('Here\'s what I know about them:')
			.setAuthor(`${name}'s User Summary`, 'attachment://icon64.png', repoURL)
			.setTimestamp()
			.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);

		if (message.channel.type === 'dm' || !args[0]) {
			userInfo
				.setTitle(message.author.tag)
				.setThumbnail(`${message.author.displayAvatarURL({ dynamic:true })}?size=256`)
				.addFields(
					{ name: 'Developer ID:', value: `\`${message.author.id}\`` },
					// { name: 'Last known message:', value: `${message.author.lastMessage ? `"${message.author.lastMessage}"` : 'Unknown'}`, inline: true },
					{ name: 'Creation Date:', value: `${message.author.createdAt}` },
				);

			message.channel.send(userInfo)
				.catch(console.error);
		}
		else {
			// checks if the member was mentioned
			const userID = args[0].match(/^<@!?(?<id>\d+)>$/u);
			let roles = '';

			// if it was mentioned then you don't have to search for a member in the server
			if (userID) {
				message.guild.members.fetch(userID[1])
					.then((member) => {
						member.roles.cache.forEach((role) => {
							if (roles.length === 0) {
								roles = `\`${role.name}\``;
							}
							else {
								roles += `, \`${role.name}\``;
							}
						});

						userInfo
							.setColor(member.displayHexColor)
							.setTitle(`${member.nickname ? `${member.nickname} (${member.user.tag})` : `${member.user.tag}`}`)
							.setThumbnail(`${member.user.displayAvatarURL({ dynamic:true })}?size=256`)
							.addFields(
								{ name: 'Developer ID:', value: `\`${member.id}\``, inline: true },
								// { name: 'Last known message:', value: `${member.lastMessage ? `"${member.lastMessage}"` : 'Unknown'}`, inline: true },
								{ name: 'Creation Date:', value: `${member.user.createdAt}` },
								{ name: 'Roles on this server:', value: roles },
								{ name: 'Joined this server on:', value: member.joinedAt },
							);

						message.channel.send(userInfo)
							.catch(console.error);
					});
			}
			else {
				const memberName = args.join(' ').toLowerCase();
				let foundMember = false;

				message.guild.members.fetch()
					.then((members) => {
						members.forEach((member) => {
							// only runs if a member has been found and the name matches
							if (foundMember === false && (member.nickname && member.nickname.toLowerCase() === memberName || member.user.username.toLowerCase() === memberName)) {
								foundMember = true;

								member.roles.cache.forEach((role) => {
									if (roles.length === 0) {
										roles = `\`${role.name}\``;
									}
									else {
										roles += `, \`${role.name}\``;
									}
								});

								userInfo
									.setColor(member.displayHexColor)
									.setTitle(`${member.nickname ? `${member.nickname} (${member.user.tag})` : `${member.user.tag}`}`)
									.setThumbnail(`${member.user.displayAvatarURL({ dynamic:true })}?size=256`)
									.addFields(
										{ name: 'Developer ID:', value: `\`${member.id}\``, inline: true },
										// { name: 'Last known message:', value: `${member.lastMessage ? `"${member.lastMessage}"` : 'Unknown'}`, inline: true },
										{ name: 'Creation Date:', value: `${member.user.createdAt}` },
										{ name: 'Roles on this server:', value: roles },
										{ name: 'Joined this server on:', value: member.joinedAt },
									);

								message.channel.send(userInfo)
									.catch(console.error);
							}
						});

						if (foundMember === false) {
							message.channel.send(`Could not find member "${memberName}"`);
						}
					}).catch(console.error);
			}
		}
	},
};
