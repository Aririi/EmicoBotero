"use strict";

const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    EmbedBuilder,
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Tests API and client delay")
        .setDMPermission(true),
    permissions: new PermissionsBitField([
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        const message = await interaction.deferReply({ fetchReply: true });

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Pong!")
            .addFields({
                name: "API latency",
                value: `${interaction.client.ws.ping}ms`,
                inline: true
            }, {
                name: "Client latency",
                value: `${message.createdTimestamp - interaction.createdTimestamp}ms`,
                inline: true
            });

        await interaction.editReply({ embeds: [embed] });
    }
};