"use strict";

const { MessageEmbed } = require("discord.js");
const { repoURL } = require("../config.json");

module.exports = {
    name: "user",
    description: "Displays user information of author or mentioned user",
    aliases: [ "userinfo" ],
    usage: "<username/nickname>",
    execute(message, args) {
        const userInfo = new MessageEmbed()
            .attachFiles([ "./icons/icon64.png" ])
            .setDescription("Here's what I know about them:")
            .setAuthor(`EmicoBotero's User Summary`, "attachment://icon64.png", repoURL)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic:true })}?size=32`);

        // eslint-disable-next-line no-undefined
        if (message.channel.type === "dm" || args[0] !== undefined) {
            userInfo
                .setTitle(message.author.tag)
                .setThumbnail(`${message.author.displayAvatarURL({ dynamic:true })}?size=256`)
                .addFields(
                    { name: "Developer ID:", value: `\`${message.author.id}\`` },
                    { name: "Last known message:", value: `${message.author.lastMessage ? `"${message.author.lastMessage}"` : "Unknown"}`, inline: true },
                    { name: "Creation Date:", value: `${message.author.createdAt}` },
                );

            message.channel.send(userInfo)
                .catch(console.error);
        } else {
            const userID = args[0].match(/^<@!?(?<id>\d+)>$/u);

            if (userID) {
                message.guild.members.fetch(userID[1])
                    .then((member) => {
                        userInfo
                            .setColor(member);

                        message.channel.send(userInfo)
                            .catch(console.error);
                    });
            } else {
                const userRegex = new RegExp(`${args.join(" ")}`, "giu");
                let foundMember = false;
                let roles = "";

                message.guild.members.fetch()
                    .then((members) => {
                        members.forEach((member) => {
                            if (foundMember === false && (member.nickname && member.nickname.match(userRegex) || member.user.username.match(userRegex))) {
                                foundMember = true;

                                member.roles.forEach((role) => {
                                    if (roles.length === 0) {
                                        roles = `\`${role.name}\``;
                                    } else {
                                        roles += `, \`${role.name}\``;
                                    }
                                });

                                userInfo
                                    .setTitle(`${member.nickname ? `${member.nickname} (${member.user.tag})` : `${member.user.tag}`}`)
                                    .setThumbnail(`${message.author.displayAvatarURL({ dynamic:true })}?size=256`)
                                    .addFields(
                                        { name: "Developer ID:", value: `\`${member.id}\``, inline: true },
                                        { name: "Last known message:", value: `${member.lastMessage ? `"${member.lastMessage}"` : "Unknown"}`, inline: true },
                                        { name: "Creation Date:", value: `${member.user.createdAt}` },
                                        { name: "Roles on this server:", value: roles },
                                        { name: "Joined this server on:", value: member.joinedAt },
                                    );

                                message.channel.send(userInfo)
                                    .catch(console.error);
                            }
                        });
                    }).catch(console.error);
            }
        }
    },
};
