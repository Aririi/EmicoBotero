"use strict";

const { prefix, repoURL } = require("../config.json");
let { name } = require("../config.json");
const Discord = require("discord.js");

module.exports = {
    name: "help",
    description: "Lists all of my commands or info about a specific command.",
    aliases: [ "commands" ],
    usage: "<command name>",
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;
        const HelpEmbed = new Discord.MessageEmbed()
            .setColor("#E7A84B")
            .setTitle(`EmicoBotero's Commands:`)
            .attachFiles([ "./icons/icon64.png" ])
            .addFields(
                { name: `EmicoBotero's current prefix: \`${prefix}\``, value: "\u200B", inline: false },
                { name: "Command List:", value: `\`${commands.map(command => command.name).join(", ")}\`` },
                { name: "How to get more information:", value: `\nYou can send \`${prefix}help [command name]\` to get info on a specific command.` },
            )
            .setAuthor(`EmicoBotero Matrix`, "attachment://icon64.png", repoURL)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);

        if (args.length === 0) {
            return message.channel.send(HelpEmbed);
        }

        name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply("that's not a valid command!");
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) {
            data.push(`**Aliases:** \`${command.aliases.join(", ")}\``);
        }
        if (command.description) {
            data.push(`**Description:** ${command.description}`);
        }
        if (command.usage) {
            data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);
        }

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });
    },
};
