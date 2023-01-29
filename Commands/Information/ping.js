const Discord = require("discord.js");

// Command to see Client latency (Bot)
module.exports = {
    data: new Discord.SlashCommandBuilder()
    .setName("ping")
    .setDescription("See bot latency."),

    execute (interaction, client) {

        // Message reply with Client latency
        interaction.reply({content: `❓︎ | The latency of the bot is \`${client.ws.ping}ms.\``});
    }
}