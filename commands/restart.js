"use strict";

module.exports = {
    name: "restart",
    description: "Restarts the bot. Should reboot automatically. (devOnly)",
    aliases: [ "reboot", "nap", "sleep" ],
    devOnly: true,
    execute() {
        process.exit(0);
    },
};
