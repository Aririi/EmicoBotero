const Discord = require('discord.js');
const { name, repoURL, userColor } = require('../config.json');
let userEmbed; let title; let lastMsg;

// matches text to a member in the guild, if applicable (so @ becomes optional)
function findUser(message, args, sendUser) {
	const userRegex = new RegExp(`(${args.join(' ')})`, 'gi');
	let matchFound = false;
	// fetches all members and checks each if there's a match
	message.guild.members.fetch()
		.then(members => {
			members.forEach(member => {
				// will not look for a match if one was already found, that way searches are in order as looped
				if (!matchFound) {
					// checks if user data array has nickname to avoid errors
					if (member.nickname != null) {
						if (member.user.username.match(userRegex)) {matchFound = true; return sendUser(member);}
						else if (member.nickname.match(userRegex)) {matchFound = true; return sendUser(member);}
					}
					else if (member.user.username.match(userRegex)) {matchFound = true; return sendUser(member);}
				}
			});
			if (!matchFound) {message.channel.send('Couldn\'t find that user...');}
		},
		).catch(error => console.error(error));
}


module.exports = {
	name: 'user',
	description: 'Displays user information of author or mentioned user.',
	aliases: ['user-info'],
	usage: '<username/nickname>',
	execute(message, args, client) {
		// arg and command exec location checks
		// if an argument is provided, assume author is asking for another user's data
		if (args[0] != undefined) {
			const userID = args[0].match(/^<@!?(\d+)>$/);
			// if DM, searching not possible
			if (message.channel.type === 'dm') {
				if (!userID) {message.channel.send('You can\'t search for other users in a DM.');}
				else {client.users.fetch(userID[1]).then(user => sendDMUser(user));}
			}
			// if in a guild, search is possible
			else if (!userID && message.channel.type != 'dm') {findUser(message, args, sendGuildUser);}
			else {message.guild.members.fetch(userID[1]).then(user => sendGuildUser(user));}
		}
		else if (message.channel.type === 'dm') {sendDMUser(message.author);}
		else {message.guild.members.fetch(message.author.id).then(user => sendGuildUser(user));}

		// sends the embed once all information is collected, will organize as needed with itself
		function sendDMUser(userToCheck) {
			// two embed forms, depending on if guild or DM
			if (userToCheck.lastMessage === null) {lastMsg = 'Unknown';}
			else {lastMsg = `"${userToCheck.lastMessage}"`;}

			userEmbed = new Discord.MessageEmbed()
				.attachFiles(['./icons/icon64.png'])
				.setColor(userColor)
				.setTitle(`${userToCheck.tag}`)
				.setThumbnail(`${userToCheck.displayAvatarURL({ dynamic:true })}?size=256`)
				.setDescription('Here\'s what I know about them:')
				.addFields(
					{ name: 'Developer ID:', value: `\`${userToCheck.id}\`` },
					{ name: 'Last known message:', value: lastMsg, inline: true },
					{ name: 'Creation Date:', value: `${userToCheck.createdAt}` },
				)
				.setAuthor(`${name}'s User Summary`, 'attachment://icon64.png', repoURL)
				.setTimestamp()
				.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);

			message.channel.send(userEmbed).catch(error => console.error(error));
		}

		function sendGuildUser(userToCheck) {
			// checks for nickname, if given or found, title in embed will contain it
			if (userToCheck.nickname != undefined) {title = `${userToCheck.nickname} (${userToCheck.user.tag})`;}
			else {title = userToCheck.user.tag;}
			// change value in field if msg found or not
			if (userToCheck.lastMessage == null || undefined) {lastMsg = 'Unknown';}
			else {lastMsg = `"${userToCheck.lastMessage}"`;}
			const guildJoinTime = userToCheck.joinedAt;

			// resolves roles the user has
			let roleNames = []; const roles = userToCheck._roles;
			roles.forEach(role => {
				role = message.guild.roles.resolve(role, true);
				if (roleNames[0] != undefined) {roleNames += `, "${role.name}"`;}
				else {roleNames = `"${role.name}"`;}
			});

			userToCheck = userToCheck.user;
			userEmbed = new Discord.MessageEmbed()
				.attachFiles(['./icons/icon64.png'])
				.setColor(userColor)
				.setTitle(title)
				.setThumbnail(`${userToCheck.displayAvatarURL({ dynamic:true })}?size=256`)
				.setDescription('Here\'s what I know about them:')
				.addFields(
					{ name: 'Developer ID:', value: `\`${userToCheck.id}\``, inline: true },
					{ name: 'Last known message:', value: lastMsg, inline: true },
					{ name: 'Creation Date:', value: `${userToCheck.createdAt}` },

				)
				.addFields(
					{ name: 'Roles on this server:', value: roleNames },
					{ name: 'Joined this server on:', value: guildJoinTime },
				)
				.setAuthor(`${name}'s User Summary`, 'attachment://icon64.png', repoURL)
				.setTimestamp()
				.setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);

			message.channel.send(userEmbed).catch(error => console.error(error));
		}
	},
};
