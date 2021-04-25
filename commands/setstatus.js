'use strict';

module.exports = {
	name: 'setstatus',
	description: 'Provide type and addendum to set bot status (devOnly)',
	aliases: [ 'setpresence', 'setactivity' ],
	usage: '<LISTENING/WATCHING/PLAYING/STREAMING> <text>',
	devOnly: true,
	args: 2,
	execute(message, args) {
		const type = args[0].toUpperCase();
		args.shift();
		const text = args.join(' ');

		if (type.match(/LISTENING|WATCHING|PLAYING|STREAMING/iu)) {
			message.client.user.setActivity(text, { type })
				.then(() => {
					message.channel.send(`Status changed to \`${type}\` with text \`${text}\``)
						.catch(console.error);
				})
				.catch(console.error);
		}
		else {
			message.channel.send('Type is not valid');
		}
	},
};
