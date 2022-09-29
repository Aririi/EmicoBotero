"use strict";

const { existsSync, writeFileSync } = require("node:fs");
const { join: joinPaths } = require("node:path");

const defaultSettings = JSON.stringify({
    "developerIds": [],
    "testServer": [],
    "errorChannels": []
}, null, 4);
const configPath = joinPaths(__dirname, "config.json");

// make sure the file exists
if (!existsSync(configPath)) {
    writeFileSync(configPath, defaultSettings, "utf-8");
}

// make sure the file can be read
try {
    require(configPath);
} catch {
    console.error("An error occurred while reading config file. Reverting to default settings.");
    writeFileSync(configPath, defaultSettings, "utf-8");
}

const config = require(configPath);
const { developerIds, testServer, errorChannels } = config;
let write = false;

// validate property types
for (const property of [developerIds, testServer, errorChannels]) {
    if (!property || !Array.isArray(property)) {
        write = true;
        if (typeof property === "string") {
            config[`${property}`] = [property];
        } else {
            config[`${property}`] = [];
        }
    } else {
        property.filter((id) => typeof id === "string");
    }
}

if (write) {
    writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
}

console.log("Successfully validated config file");