"use strict";

const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setstatus")
        .setDescription("Changes the bot status (developer only)")
        .addStringOption(
            (option) => option.setName("type")
                .setDescription("Type of status")
                .setRequired(true)
                .addChoices(
                    { name: "Playing", value: "playing" },
                    { name: "Streaming", value: "streaming" },
                    { name: "Listening", value: "listening" },
                    { name: "Watching", value: "watching" },
                    { name: "Competing", value: "competing" }
                )
        )
        .addStringOption(
            (option) => option.setName("text")
                .setDescription("Text appended after status type")
                .setRequired(true)
        )
        .setDMPermission(true),
    devOnly: true,
    permissions: new PermissionsBitField([
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();

        const name = interaction.options.getString("text");

        const typeEnum = {
            "Playing": 0,
            "Streaming": 1,
            "Listening": 2,
            "Watching": 3,
            "Competing": 5
        };
        let stringType = interaction.options.getString("type");
        stringType = stringType.charAt(0).toUpperCase() + stringType.slice(1);
        const type = typeEnum[stringType];

        await interaction.client.user.setPresence({ activities: [{ name, type }] });

        await interaction.editReply(
            `Successfully updated bot status to: \`${stringType}`
            + `${type === 2 ? " to" : ""}${type === 5 ? " in" : ""} ${name}\``
        );
    }
};