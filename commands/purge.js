"use strict";

const {
    ChatInputCommandInteraction, /* eslint-disable-line no-unused-vars */
    PermissionsBitField,
    SlashCommandBuilder
} = require("discord.js");
const { Flags: { ManageMessages } } = PermissionsBitField;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Bulk deletes messages")
        .setDefaultMemberPermissions(ManageMessages)
        .addIntegerOption(
            (option) => option.setName("amount")
                .setDescription("How many messages to delete")
                .setRequired(true)
        )
        .setDMPermission(false),
    permissions: new PermissionsBitField([
        "ManageMessages",
        "SendMessages",
        "SendMessagesInThreads"
    ]),
    /** @param {ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();

        const amount = interaction.options.getInteger("amount");
        let remainingAmount = amount;
        if (amount < 1) {
            await interaction.editReply("The amount must be greater than zero");
            return;
        } else if (amount <= 100) {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            remainingAmount -= deleted.size;

            if (remainingAmount === 0) {
                return;
            }
        } else {
            while (true) {
                const deleted = interaction.channel.bulkDelete(100, true);
                remainingAmount -= deleted.size;

                if (remainingAmount === 0 || deleted.size < 100) {
                    break;
                }
            }

            if (remainingAmount === 0) {
                return;
            }
        }

        const remainingMessages = interaction.channel.messages.fetch({
            limit: remainingAmount,
            cache: false
        });

        remainingMessages.map((message) => message.delete());

        await Promise.allSettled(remainingMessages.keys());
        await interaction.editReply(`Successfully deleted ${amount} messages`);
    }
};