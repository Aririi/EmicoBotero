"use strict";

const { fork } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join: joinPaths } = require("node:path");
// const { createClient: createRedisClient } = require("redis");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { GuildMessages, Guilds, MessageContent } = GatewayIntentBits;

require("dotenv").config();
const { DISCORD_TOKEN } = process.env;

function runScript(path) {
    const scriptProcess = fork(path, null, {
        cwd: process.cwd(),
        detached: false,
        stdio: "pipe"
    });

    scriptProcess.stdout.on("data", (chunk) => console.log(chunk.toString().slice(0, -1)));

    const buf = [];
    scriptProcess.stderr.on("data", (chunk) => buf.push(chunk));
    scriptProcess.on("exit", () => {
        if (buf.length !== 0) {
            console.error(
                "An error occurred while validating config file:\n"
                + `${Buffer.concat(buf).toString()}`
            );
            process.exit(1);
        }
    });
}

const validationScriptPath = joinPaths(__dirname, "validateConfig.js");
runScript(validationScriptPath);

const client = new Client({ intents: [GuildMessages, Guilds, MessageContent] });
client.commands = new Collection();

// WIP
// client.redisClient = createRedisClient()
//     .once("ready", () => {
//         console.log("Successfully connected to database");
//     })
//     .on("error", (error) => {
//         console.error(`Redis client error: ${error}`);
//         process.exit(1);
//     });

// (async () => {
//     await client.redisClient.connect();
// })();

const commandsPath = joinPaths(__dirname, "commands");
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(joinPaths(commandsPath, file));
    client.commands.set(command.data.name, command);
}

const eventsPath = joinPaths(__dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(joinPaths(eventsPath, file));

    if (event.once) {
        client.once(event.name, async (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, async (...args) => event.execute(...args, client));
    }
}

client.login(DISCORD_TOKEN);