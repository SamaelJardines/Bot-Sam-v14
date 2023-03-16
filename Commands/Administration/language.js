const Discord = require("discord.js");
const { PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Command to set language Bot
module.exports = {
    data: new Discord.SlashCommandBuilder()
    .setName('language')
    .setDescription('Select language bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction) {

        // Create new menu selector for language selector
        const languageSelector = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('selectlanguage')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        {
                            label: "en-US",
                            value: "US"
                        },
                        {
                            label: "es-ES",
                            value: "ES"
                        }
                    ),
        );

        // Message reply with Select Menu
        await interaction.reply({ components: [languageSelector] });

    }
}