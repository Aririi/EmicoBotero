"use strict";

module.exports = {
    name: "test",
    ownerOnly: true,
    execute(message) {
        message.channel.send("test");
    },
};
