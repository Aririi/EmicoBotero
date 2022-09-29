"use strict";

const { spawn } = require("node:child_process");
const { join: joinPaths } = require("node:path");
const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");
const { developerIds } = require("../config.json");

require("dotenv").config();
const { DISCORD_TOKEN } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Restarts the bot (developer only)")
        .addStringOption(
            (option) => option.setName("type")
                .setDescription("Whether to destroy the client (soft) or "
                                + "kill the process (hard); defaults to hard")
                .addChoices(
                    { name: "Soft", value: "soft" },
                    { name: "Hard", value: "hard" }
                )
                .setRequired(false)
        )
        .setDMPermission(true),
    devOnly: true,
    permissions: new PermissionsBitField([
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.reply("Restarting in 5 seconds");

        const filter = (response) => developerIds.includes(response.author.id)
                                     && response.content.toLowerCase() === "cancel";
        const messages = await interaction.channel.awaitMessages({
            filter,
            max: 1,
            time: 5000
        });

        if (messages.size === 0) {
            interaction.client.user.setStatus("invisible");

            if (interaction.options.getString("type") === "soft") {
                interaction.client.destroy();
                interaction.client.login(DISCORD_TOKEN);
            } else {
                await interaction.client.database.quit();

                process.on("exit", () => {
                    spawn("node", [joinPaths(__dirname, "../index.js")], {
                        cwd: process.cwd(),
                        stdio: "inherit",
                        detached: true,
                        shell: true,
                        windowsHide: false
                    });
                });
                process.exit(0);
            }
        } else {
            await interaction.followUp("Canceled");
        }
    }
};