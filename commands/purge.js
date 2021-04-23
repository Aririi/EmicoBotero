module.exports = {
	name: 'purge',
	description: 'Deletes messages in the amount specified (1 to 99.)',
	aliases: ['delete', 'prune'],
	guildOnly: true,
	args: true,
	execute(message, args) {
		const amount = Number(args[0]) + 1;
		// just a funny thing
		if (args[0] === 'juice') {return message.channel.send('Not that kind of prune, silly!');}
		if (isNaN(amount)) {return message.reply('that doesn\'t seem to be a valid number.');}
		else if (amount <= 1 || amount > 100) {return message.reply('you need to input a number between 1 and 99.');}
		if (message.member.hasPermission('MANAGE_MESSAGES') == true) {
			message.channel.bulkDelete(amount, false)
				.then(console.log(`Deleted ${amount} messages per ${message.author.tag}'s request.`))
				.catch(err => {
					console.error(err);
					message.channel.send('There was an error trying to prune messages in this channel. (Try checking my permissions.)');
				});
		}
		else {return message.reply('you need the \'Manage Messages\' permission to use this command.');}
	},
};
