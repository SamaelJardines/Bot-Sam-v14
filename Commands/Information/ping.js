const Discord = require("discord.js");
const Schema = require("../../Models/guildSchema");

// Command to see Client latency (Bot)
module.exports = {
    data: new Discord.SlashCommandBuilder()
    .setName("ping")
    .setDescription("See bot latency."),

    async execute (interaction, client) {

        // Lookup data in DataBase and set variable with data
        let guildSavedSchema = await Schema.findOne({ Guild: interaction.guild.id });

        // Find file language selected in database
        const lang = require(`../../Languages/${guildSavedSchema.Language}/commands/information/ping.json`);

        // Message reply with Client latency
        interaction.reply({content: `${lang.Ping} \`${client.ws.ping}ms.\``});
    }
}