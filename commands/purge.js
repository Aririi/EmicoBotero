'use strict';

module.exports = {
	name: 'purge',
	description: 'Deletes messages in the amount specified (1 to 100)',
	aliases: [ 'delete', 'prune' ],
	guildOnly: true,
	args: 1,
	execute(message, args) {
		const amount = parseInt(args[0], 10) + 1;

		if (isNaN(amount)) {
			return message.reply('That doesn\'t seem to be a valid number');
		}
		else if (amount <= 1 || amount > 100) {
			return message.reply('You need to input a number between 1 and 100');
		}

		if (message.member.hasPermission('MANAGE_MESSAGES')) {
			console.log(`${message.author.tag} has bulk deleted ${amount} messages in #${message.channel.name} in server ${message.guild.name}`);

			message.channel.bulkDelete(amount, false)
				// .then(console.log(`Deleted ${amount} messages per ${message.author.tag}'s request`))
				.catch(console.error);
		}
		else {
			return message.reply('You need the `Manage Messages` permission to use this command');
		}
	},
};
