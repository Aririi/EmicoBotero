"use strict";

const { existsSync } = require("node:fs");
const { join: joinPaths } = require("node:path");
const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");
const { testServer } = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Updates the state of a command or event (developer only)")
        .addStringOption(
            (option) => option.setName("type")
                .setDescription("Whether to update a command or an event")
                .setRequired(true)
                .addChoices(
                    { name: "command", value: "command" },
                    { name: "event", value: "event" }
                )
        )
        .addStringOption(
            (option) => option.setName("filename")
                .setDescription("Name of the file")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDMPermission(true),
    devOnly: true,
    permissions: new PermissionsBitField([
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const {
            client,
            client: { application: { commands: appCommands } }
        } = interaction;

        let fileName = interaction.options.getString("filename");
        if (fileName.indexOf(".") !== -1) {
            fileName = fileName.slice(0, fileName.indexOf("."));
        }

        if (interaction.options.getString("type") === "command") {
            const commandFile = joinPaths(__dirname, `${fileName}.js`);
            if (!existsSync(commandFile)) {
                await interaction.editReply(`Couldn't find file \`${fileName}.js\``);
                return;
            }

            let commandExists = false;
            if (client.commands.get(fileName)) {
                commandExists = true;
            }

            delete require.cache[require.resolve(commandFile)];

            const command = require(commandFile);
            const commandName = command.data.name;

            if (fileName !== commandName) {
                await interaction.editReply("Filename must be the same as command name");
                return;
            }

            client.commands.set(commandName, command);

            await interaction.editReply(`Successfully updated command \`${commandName}\`'s code`);

            if (commandExists) {
                return;
            }

            if (commandName === "test" && testServer !== "") {
                await appCommands.create(command.data.toJSON(), testServer);

                await interaction.followUp({
                    content: "Successfully created test command in test server",
                    ephemeral: true
                });
            } else {
                await appCommands.create(command.data.toJSON());

                await interaction.followUp({
                    content: `Successfully created global command "${commandName}"`,
                    ephemeral: true
                });
            }
        } else {
            const eventFile = joinPaths(__dirname, "../events", `${fileName}.js`);
            if (!existsSync(eventFile)) {
                await interaction.editReply(`Couldn't find file \`${fileName}.js\``);
                return;
            }

            if (!client.eventNames().includes(fileName)) {
                await interaction.editReply(`Couldn't find event \`${fileName}\``);
                return;
            }

            const event = require(eventFile);

            if (fileName !== event.name) {
                await interaction.editReply(`Filename must be the same as event name`);
                return;
            }

            client.removeAllListeners(event.name);
            if (event.once) {
                client.once(event.name, async (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, async (...args) => event.execute(...args, client));
            }

            await interaction.editReply(`Successfully updated event \`${event.name}\``);
        }
    }
};