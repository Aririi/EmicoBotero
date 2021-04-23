const { prefix } = require('../config.json');

module.exports = {
	name: 'setstatus',
	description: 'Provide type and addendum to set bot status (devOnly).',
	aliases: ['setpresence', 'setactivity'],
	usage: '<LISTENING/WATCHING/PLAYING/STREAMING] [text>',
	devOnly: true,
	args: true,
	execute(message, args, client) {
		const type = args[0].toUpperCase();
		args.shift(); const text = args.join(' ');
		// removes command from message
		if (args[1] === undefined) {
			return message.channel.send(
				`${message.author.username}: Insufficient arguments.\n
				Usage: ${module.exports.usage} (note: LISTENING type already contains 'to')\n
				Example: \`${prefix}setstatus listening Beethoven's Fifth\`\n
				Result: "Listening to Beethoven's Fifth"`,
			);
		}
		console.log(`STATUS: Changed to type ${type} and text "${text}"`);
		client.user.setActivity(text, { type: type })
			.then(message.channel.send(`Status changed to '${type}' with text '${text}'`))
			.catch(error => console.error(error));
	},
};
