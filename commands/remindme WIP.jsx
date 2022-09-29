"use strict";

const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remindme")
        .setDescription("Sends you a message after the amount of time inputted passes")
        .addIntegerOption(
            (option) => option.setName("days")
                .setDescription("In how many days to message you")
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(7)
        )
        .addIntegerOption(
            (option) => option.setName("hours")
                .setDescription("In how many hours to message you")
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(23)
        )
        .addIntegerOption(
            (option) => option.setName("minutes")
                .setDescription("In how many minutes to message you")
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(59)
        )
        .addStringOption(
            (option) => option.setName("message")
                .setDescription("What message to send you")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(50)
        ),
    permissions: new PermissionsBitField([
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();

        const days = interaction.options.getInteger("days");
        const hours = interaction.options.getInteger("hours");
        const minutes = interaction.options.getInteger("minutes");

        if (days === hours === minutes === 0) {
            await interaction.editReply("The time must be non zero");
        }
    }
};