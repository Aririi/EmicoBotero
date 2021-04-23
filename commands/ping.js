module.exports = {
	name: 'ping',
	description: 'Ping! (Shows latency between bot and server.)',
	cooldown: 5,
	execute(message) {
		const responseTime = Math.round(Date.now() - message.createdTimestamp);
		// This will round the response time between when the message was received and when the message was sent
		message.channel.send(`Pong! (Discord reply in ${responseTime}ms)`);
	},
};
