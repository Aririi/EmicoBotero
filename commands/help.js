"use strict";

const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    EmbedBuilder,
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Lists all of the commands")
        .setDMPermission(true),
    permissions: new PermissionsBitField([
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();

        let description = "";
        interaction.client.commands.forEach((command) => {
            description += `\`${command.data.name}\` - ${command.data.description}\n\n`;
        });
        // remove the last newline characters
        description = description.slice(0, description.length - 2);

        const embed = new EmbedBuilder()
            .setColor(0x0048BA)
            .setTitle("Commands")
            .setDescription(description);

        await interaction.editReply({ embeds: [embed] });
    }
};