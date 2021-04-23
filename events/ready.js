'use strict';

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`MAIN: Logged in as ${client.user.tag}`);
	},
};
