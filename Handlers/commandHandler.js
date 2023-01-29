const Discord = require("discord.js");
const fs = require("fs");

// Find specific (Commands) dir
const commandsDir = `${process.cwd()}/commands`;

// We need Client ID from config.json (Bot ID)
const config = require("../config.json");

require("dotenv").config();
const { TOKEN } = process.env;

module.exports = client => {

    // Declare variable and then upload Slash Commands to Discord
    let arrayCommands = [];

    // Create a command collection
    client.commands = new Discord.Collection();

    // Find all files ending with .js
    fs.readdirSync(commandsDir).forEach(async dir => {
        const commands = fs.readdirSync(`${commandsDir}/${dir}`).filter(file => file.endsWith(".js"));

        for (const file of commands) {
            // Require a file in dir to load
            const command = require(`${commandsDir}/${dir}/${file}`);

            // Set all data commands
            client.commands.set(command.data.name, command);

            // Push variable with data commands
            arrayCommands.push(command.data.toJSON());
        }

        await new Discord.REST({version: 10}).setToken(TOKEN).put(

            // Load commands in specific Channel to test new commands
            Discord.Routes.applicationGuildCommands(config.clientID, "853482244739563541"), {
                body: arrayCommands
            }

            // Load commands globally 
            /*Discord.Routes.applicationCommands(config.clientID), {
                body: arrayCommands
            }*/
        )
    });
}