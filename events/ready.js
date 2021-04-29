'use strict';

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Logged in successfully as ${client.user.tag}`);
	},
};
