"use strict";

const { get } = require("node:https");
const { createHash } = require("node:crypto");
const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    EmbedBuilder,
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");

/**
 * @param {String} query
 * @param {ChatInputCommandInteraction} interaction
 */
function outputBooruImage(query, interaction) {
    const base = "https://danbooru.donmai.us/posts.json";

    get(`${base}?format=json&tags=rating%3Ag+${query}`, (res) => {
        const buf = [];
        res.on("data", (chunk) => buf.push(chunk));

        res.on("end", async () => {
            // toJSON() just returns a buffer again
            let image = JSON.parse(Buffer.concat(buf).toString());

            if (image?.success === false) {
                // replaces 2 with 1 for the rare case of someone somehow tricking
                // the program into putting in two additional tags when its supposed
                // to be limited into one
                await interaction.editReply(`Could not fetch post: \`${image.message.replace("2", "1")}\``);
                return;
            }

            if (Array.isArray(image)) {
                if (image.length === 0) {
                    await interaction.editReply(`No post fitting the criteria found`);
                    return;
                }
            }

            if (Array.isArray(image)) {
                image = image.at(0);
            }

            if (image.rating !== "g") {
                await interaction.editReply("That post is too inappropriate");
                return;
            }

            // i hope that any one post doesnt contain one or more terabytes
            const suffixes = {
                0: "B",
                1: "KB",
                2: "MB",
                3: "GB"
            };
            let order = 0;
            let size = image.file_size;
            while (size >= 1024) {
                size /= 1024;
                order += 1;
            }

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Danbooru post")
                .setURL(`https://danbooru.donmai.us/posts/${image.id}`)
                .setDescription(
                    `Size: ${size.toFixed(1)} ${suffixes[order]}\n`
                    + `Extension: ${image.file_ext}\n`
                )
                .addFields(
                    { name: "Tags", value: `\`${image.tag_string_general}\``, inline: false }
                )
                .setImage(image.has_large ? image.large_file_url : image.file_url)
                .setFooter({ text: `md5: ${image.md5}` });

            if (image.pixiv_id === null) {
                embed.setAuthor({ name: image.tag_string_artist, url: image.source });
            } else {
                const source = `https://pixiv.net/artworks/${image.pixiv_id}`;
                embed.setAuthor({ name: image.tag_string_artist, url: source });
            }

            if (image.tag_string_character) {
                embed.addFields(
                    { name: "Characters", value: `\`${image.tag_string_character}\``, inline: false }
                );
            }

            await interaction.editReply({ embeds: [embed] });
        });
    }).on("error", async (error) => {
        console.error(error);
        await interaction.editReply(
            `An error occurred while fetching post: `
            + `\`${error.name}: ${error.message}\``
        );
    });
}

/**
 * @param {String} url
 * @returns {String}
 */
function getImageMd5(url) {
    return new Promise((resolve, reject) => {
        get(url, (res) => {
            if (res.statusCode === 200) {
                const hash = createHash("md5");
                hash.setEncoding("hex");
                res.once("end", () => {
                    hash.end();
                    resolve(hash.read());
                });
                res.pipe(hash);
            } else {
                res.resume();
                reject(new Error(`Image request failed, ${res.statusMessage}: ${res.statusCode}`));
            }
        });
    });
}

// options and their corresponding tag
const tagEnum = {
    "random": "",
    "waifu": "1girl",
    "husbando": "1boy",
    "kemonomimi": "kemonomimi"
};

const data = new SlashCommandBuilder()
    .setName("booru")
    .setDescription("Gets a post from danbooru")
    .addSubcommand(
        (subcommand) => subcommand.setName("random")
            .setDescription("Gets a post from danbooru")
    )
    .addSubcommandGroup(
        (group) => group.setName("search")
            .setDescription("Searches for a specific post")
            .addSubcommand(
                (subcommand) => subcommand.setName("tag")
                    .setDescription("Gets a random post filtered with a tag")
                    .addStringOption(
                        (option) => option.setName("tag")
                            .setDescription("The tag to filter the posts with")
                            .setRequired(true)
                            .setMaxLength(50)
                    )
            )
            .addSubcommand(
                (subcommand) => subcommand.setName("md5")
                    .setDescription("Searches for a matching md5 hash")
                    .addStringOption(
                        (option) => option.setName("hash")
                            .setDescription("The hash of the media")
                            .setRequired(true)
                            .setMinLength(32)
                            .setMaxLength(32)
                    )
            )
            .addSubcommand(
                (subcommand) => subcommand.setName("attachment")
                    .setDescription("Searches for a matching attachment")
                    .addAttachmentOption(
                        (option) => option.setName("attachment")
                            .setDescription("The attachment")
                            .setRequired(true)
                    )
            )
    );

const { random: _, ...withoutRandom } = tagEnum;
Object.keys(withoutRandom).forEach((tag) => {
    data.addSubcommand(
        (subcommand) => subcommand.setName(tag)
            .setDescription(`Gets an image of a ${tag}`)
    );
});

module.exports = {
    data,
    permissions: new PermissionsBitField([
        "EmbedLinks",
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();

        const { options } = interaction;

        const getRandom = "random%3A1";
        if (options.getSubcommandGroup() === "search") {
            const subCommandName = options.data.at(0).options.at(0).name;

            let option = null;
            if (subCommandName === "attachment") {
                option = options.getAttachment(subCommandName);
            } else {
                // md5 is the only subcommand whose option doesnt have the same name
                option = options.getString(subCommandName.replace("md5", "hash"));
            }

            switch (subCommandName) {
            case "tag":
                option = encodeURIComponent(option.replace(" ", "_"));
                outputBooruImage(`${getRandom}+${option}`, interaction);

                break;
            case "md5":
                if (!(/^[a-f0-9]{32}$/gi.test(option))) {
                    await interaction.editReply("Invalid md5 hash provided");
                    return;
                }

                outputBooruImage(`&md5=${option}`, interaction);

                break;
            case "attachment":
                try {
                    const imageHash = await getImageMd5(option.url);

                    outputBooruImage(`&md5=${imageHash}`, interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.editReply(
                        "Something went wrong while downloadind image, "
                        + `${error.name}: ${error.message}`
                    );
                }

                break;
            }
        } else {
            const subCommandName = options.data.at(0).name;
            outputBooruImage(`${getRandom}+${tagEnum[subCommandName]}`, interaction);
        }
    }
};