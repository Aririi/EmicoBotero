module.exports = {
	name: 'restart',
	description: 'Restarts the bot. Should reboot automatically. (devOnly)',
	aliases: ['reboot', 'nap', 'sleep'],
	devOnly: true,
	execute(message) {
		console.log(`MAIN: ${message.author.tag} {${message.author.id}} has executed the restart command.`);
		message.channel.send('Clearing irrelevant list.\n(Reinstatiating in 1.618 seconds.)').then(setTimeout(function() {process.exit();}, 100));
	},
};
