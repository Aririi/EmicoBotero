"use strict";

module.exports = {
    name: "restart",
    description: "Restarts the bot. Should reboot automatically. (devOnly)",
    aliases: [ "reboot", "nap", "sleep" ],
    ownerOnly: true,
    execute(message) {
        message.channel.send("Restarting")
            .then(process.exit(0));
    },
};
