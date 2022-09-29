"use strict";

const { writeFileSync } = require("node:fs");
const { join: joinPaths } = require("node:path");
/* eslint-disable-next-line no-unused-vars */
const { Client } = require("discord.js");
const config = require("../config.json");
const { developerIds, testServer } = config;

module.exports = {
    name: "ready",
    once: true,
    /** @param {Client} client */
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        client.user.setStatus("online");

        const { application: { commands: appCommands } } = client;

        let write = false;
        if (developerIds.length === 0) {
            write = true;

            const appMembers = [];

            // add to cache otherwise client.application.owner returns null
            await client.application.fetch();
            const appOwner = client.application.owner;

            if (appOwner?.members) {
                for (const memberId of appOwner.members.keys()) {
                    appMembers.push(memberId);
                }
            } else {
                appMembers.push(appOwner.id);
            }
            config.developerIds = appMembers;
        }

        const commands = [];
        client.commands.forEach((command) => commands.push(command.data.toJSON()));

        if (testServer !== "") {
            const testGuild = client.guilds.cache.get(testServer);

            if (typeof testGuild === "undefined") {
                try {
                    await client.guilds.fetch(testServer);
                } catch {
                    console.error("Test server ID is invalid");

                    config.testServer = "";
                    write = true;

                    return;
                }
            }

            const serverCommands = await appCommands.fetch({ guildId: testServer });

            if (serverCommands.size === 0) {
                const testCommand = commands.filter((command) => command.name === "test");
                try {
                    await appCommands.set(testCommand, testServer);
                    console.log("Successfully set test command in test server");
                } catch (error) {
                    console.error(
                        "Something went wrong while setting test command in test server,",
                        `${error.message}: ${error.code}`
                    );
                }
            } else {
                console.log("Successfully set test command in test server");
            }
        }

        if (write) {
            const configPath = joinPaths(__dirname, "../config.json");
            writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
        }

        try {
            await appCommands.set(commands.filter((command) => command.name !== "test"));
            console.log("Successfully set global commands");
        } catch (error) {
            console.error(
                "Something went wrong while setting global commands,",
                `${error.message}: ${error.code}`
            );
        }
    }
};