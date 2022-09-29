"use strict";

const { readdirSync } = require("node:fs");
const { join: joinPaths } = require("node:path");
const {
    AutocompleteInteraction, // eslint-disable-line no-unused-vars
    BaseInteraction, // eslint-disable-line no-unused-vars
    ChatInputCommandInteraction, // eslint-disable-line no-unused-vars
    EmbedBuilder,
    WebhookClient
} = require("discord.js");
const { developerIds, errorChannels } = require("../config.json");

module.exports = {
    name: "interactionCreate",
    /** @param {BaseInteraction} baseInteraction */
    async execute(baseInteraction) {
        const { client } = baseInteraction;
        const typeEnum = {
            ping: 1,
            applicationCommand: 2,
            messageComponent: 3,
            applicationCommandAutocomplete: 4,
            modalSubmit: 5
        };

        switch (baseInteraction.type) {
        case typeEnum.ping:
            break;
        case typeEnum.applicationCommand: {
            /** @type {ChatInputCommandInteraction} */
            const interaction = baseInteraction;

            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return;
            }

            if (command.devOnly && !developerIds.includes(interaction.user.id)) {
                await interaction.reply({
                    content: "This command can only be executed by the bot developers",
                    ephemeral: true
                });
                return;
            }

            // 0 means that it doesnt require any permissions
            if (!interaction.appPermissions.has(command.permissions ?? 0, true)) {
                await interaction.reply({
                    content: `Insufficient permissions given for command \`${command.name}\`, `
                             + `required: \`${command.permissions.join(", ")}\`, missing: `
                             + `\`${command.permissions.missing(interaction.appPermissions).join(", ")}\``,
                    ephemeral: true
                });
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);

                try {
                    await interaction.reply({
                        content: "An error occurred",
                        ephemeral: true
                    });
                } catch {
                    await interaction.editReply({
                        content: "An error occurred",
                        ephemeral: true
                    });
                }

                if (errorChannels.length === 0) {
                    return;
                }

                const username = client.user.username;
                const avatarURL = client.user.avatarURL({ forceStatic: true, size: 128 });
                const errorEmbed = new EmbedBuilder()
                    .setColor(0x000000)
                    .setTitle("**An error occurred**")
                    .addFields(
                        { name: "**Type**", value: error?.name || "Unknown" },
                        { name: "**Error**", value: error?.message || "Unknown" }
                    );
                for (const errorChannel of errorChannels) {
                    try {
                        const channelHook = new WebhookClient({ url: errorChannel });
                        channelHook.send({ username, avatarURL, embeds: [errorEmbed] });
                    } catch {
                        // if the url isnt valid
                        continue;
                    }
                }
            }

            break;
        }
        case typeEnum.messageComponent:
            break;
        case typeEnum.applicationCommandAutocomplete: {
            /** @type {AutocompleteInteraction} */
            const interaction = baseInteraction;
            let choices = [];
            let focusedValue = "";

            switch (interaction.commandName) {
            case "update": {
                focusedValue = interaction.options.getFocused();

                let path = __dirname;
                if (interaction.options.getString("type") === "command") {
                    path = joinPaths(__dirname, "../commands");
                }

                const files = readdirSync(path).filter((file) => file.endsWith(".js"));
                for (const fileName of files) {
                    choices.push(fileName.slice(0, fileName.lastIndexOf(".")));
                }

                break;
            }
            }

            if (focusedValue?.value) {
                choices = choices.filter((choise) => choise.startsWith(focusedValue.value));
            } else {
                choices = choices.filter((choise) => choise.startsWith(focusedValue));
            }

            await interaction.respond(choices.map((choise) => ({ name: choise, value: choise })));
            break;
        }
        case typeEnum.modalSubmit:
            break;
        }
    }
};