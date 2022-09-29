"use strict";

/* eslint-disable-next-line no-unused-vars */
const { Guild, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "guildCreate",
    /** @param {Guild} guild */
    async execute(guild) {
        const { me } = guild.members;
        const requiredPermissions = [
            "AttachFiles",
            "EmbedLinks",
            "ManageMessages",
            "ReadMessageHistory",
            "SendMessages",
            "SendMessagesInThreads",
            "ViewChannel"
        ];

        if (!me.permissions.has(new PermissionsBitField(requiredPermissions), true)) {
            const owner = await guild.fetchOwner();

            owner.user.send(
                `Insufficient permissions given for guild ${guild.name}, required: `
                + `\`${requiredPermissions.join(", ")}\`, missing: `
                + `\`${me.permissions.missing(requiredPermissions).join(", ")}\``
            );

            await guild.leave();
        }
    }
};