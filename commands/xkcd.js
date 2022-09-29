"use strict";

const { get } = require("https");
const { join: joinPaths } = require("node:path");
const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    EmbedBuilder,
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");

/**
 * @param {String} url
 */
function getComic(url) {
    return new Promise((resolve, reject) => {
        get(`${url}/info.0.json`, (res) => {
            if (res.statusCode === 200) {
                const buf = [];
                res.on("data", (chunk) => buf.push(chunk));

                res.on("end", () => {
                    resolve(JSON.parse(Buffer.concat(buf).toString()));
                });
            } else {
                res.resume();
                reject(new Error(`Image request failed, ${res.statusMessage}: ${res.statusCode}`));
            }
        });
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xkcd")
        .setDescription("Fetches XKCD comics")
        .addBooleanOption(
            (option) => option.setName("latest")
                .setDescription("Whether to fetch the latest comic (takes priority over number)")
                .setRequired(false)
        )
        .addNumberOption(
            (option) => option.setName("num")
                .setDescription("Comic number")
                .setMinValue(1)
                .setMaxValue(10000)
                .setRequired(false)
        ),
    permissions: new PermissionsBitField([
        "AttachFiles",
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();

        const latest = interaction.options.getBoolean("latest");
        const num = interaction.options.getNumber("num");

        const xkcdImg = joinPaths(__dirname, "../img/xkcd.jpg");
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setThumbnail("attachment://xkcd.jpg");

        let latestComic = {};
        try {
            latestComic = await getComic("https://xkcd.com");
        } catch (error) {
            console.error(
                "An error occurred while getting xkcd comic: "
                + `${error.name ?? "Unknown error"}: ${error.message ?? "Unknown"}`
            );
        }

        if (latest) {
            embed.setTitle(latestComic.title)
                .setURL(`https://xkcd.com/${latestComic.num}`)
                .setDescription(latestComic.alt)
                .setImage(latestComic.img);

            await interaction.editReply({ embeds: [embed], files: [xkcdImg] });
            return;
        }

        let url = "https://xkcd.com";
        if (num) {
            if (num > latestComic.num) {
                await interaction.editReply(`Comic #${num} doesn't exist`);
                return;
            }

            url += `/${num}`;
        } else {
            url += `/${Math.floor(Math.random() * latestComic.num)}`;
        }

        let comic = {};
        try {
            comic = await getComic(url);
        } catch (error) {
            console.error(
                "An error occurred while getting xkcd comic: "
                + `${error.name ?? "Unknown error"}: ${error.message ?? "Unknown"}`
            );
        }

        embed.setTitle(comic.title)
            .setURL(`https://xkcd.com/${comic.num}`)
            .setDescription(comic.alt)
            .setImage(comic.img);

        await interaction.editReply({ embeds: [embed], files: [xkcdImg] });
    }
};