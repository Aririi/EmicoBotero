'use strict';

module.exports = {
	name: 'restart',
	description: 'Restarts the bot. Should reboot automatically. (devOnly)',
	aliases: [ 'reboot', 'nap', 'sleep' ],
	devOnly: true,
	execute(message) {
		console.log(`${message.author.tag} has restarted the bot`);

		process.exit(0);
	},
};
