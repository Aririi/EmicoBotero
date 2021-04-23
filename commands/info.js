"use strict";

const { MessageEmbed } = require("discord.js");
const { prefix, repoURL } = require("../config.json");

module.exports = {
    name: "info",
    description: "Shows bot info.",
    aliases: [ "information", "about", "emicobotero" ],
    execute(message) {
        message.channel.send("Compiling matrices. Stand by...").then((sentMessage) => {
            const infoEmbed = new MessageEmbed()
                .setColor(`#FEB047`)
                .setTitle(`About EmicoBotero`)
                .attachFiles([ "./icons/icon400.png" ])
                .setThumbnail("attachment://icon400.png")
                .setDescription("A cooperative bot development effort for \"Emico's Empty Bliss\" on Discord using JavaScript.")
                .addFields(
                    { name: "Development Start Date:", value: "April 23, 2021" },
                    { name: "Contributors:", value: "Ariri#7998, Non-Existant#9050, Klonade#6176, Space Gura#3571", inline: true },
                    { name: "Help:", value: `\`${prefix}help\`` },
                    { name: `EmicoBotero's prefix in this server: \`${prefix}\``, value: "\u200B", inline: false },
                )
                .setAuthor("EmicoBotero", "attachment://icon400.png", repoURL)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);

            sentMessage.edit(infoEmbed);
        });
    },
};
