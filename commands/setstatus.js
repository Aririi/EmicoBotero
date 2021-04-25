"use strict";

module.exports = {
    name: "setstatus",
    description: "Provide type and addendum to set bot status (devOnly)",
    aliases: [ "setpresence", "setactivity" ],
    usage: "<LISTENING/WATCHING/PLAYING/STREAMING> <text>",
    devOnly: true,
    args: 2,
    execute(message, args) {
        if (args[0].toLowerCase().match(/listening|watching|playing|streaming/gu)) {
            const type = args[0].toUpperCase();
            args.shift();
            const text = args.join(" ");

            return message.client.user.setActivity(text, { type })
                .then(() => {
                    message.channel.send(`Status changed to \`${type}\` with text \`${text}\``)
                        .catch(console.error);
                })
                .catch(console.error);
        }

        message.channel.send("Invalid type of activity")
            .catch(console.error);
    },
};
