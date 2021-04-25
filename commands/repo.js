"use strict";

const { repoURL } = require("../config.json");

module.exports = {
    name: "repo",
    description: "Links the bot's repository.",
    aliases: [ "git", "github", "code" ],
    execute(message) {
        message.channel.send(`${message.author.username}: Here's a link to my repository: ${repoURL}`);
    },
};
