"use strict";

const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Pong! (Shows latency between bot and server)",
    cooldown: 5,
    execute(message) {
        const start = Date.now();
        message.channel.send(
            new MessageEmbed()
                .setDescription("Ping"),
        ).then((msg) => {
            const ping = Date.now() - start;
            msg.edit(
                new MessageEmbed()
                    .setDescription(`Pong\n\`Latency: ${ping}ms\``),
            );
        }).catch(console.error);
    },
};
