"use strict";

const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("Test command (developer only)"),
    permissions: new PermissionsBitField([
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    devOnly: true,
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
    }
};