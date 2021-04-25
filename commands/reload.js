'use strict';

module.exports = {
	name: 'reload',
	args: 1,
	devOnly: true,
	execute(message, args) {
		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) {
			return message.channel.send(`${message.author.username}: There is no command under the name or alias \`${commandName}\`.`);
		}

		delete require.cache[require.resolve(`./${command.name}.js`)];

		try {
			const newCommand = require(`./${command.name}.js`);
			message.client.commands.set(newCommand.name, newCommand);
			message.channel.send(`${message.author.username}: \`${command.name}\` was reloaded.`);
		}
		catch (error) {
			console.error(error);
			message.channel.send(`${message.author.username}: There was an error while reloading the command \`${command.name}\`:\n\`${error.message}\``);
		}
	},
};
