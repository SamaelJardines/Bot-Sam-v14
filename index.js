const Discord = require("discord.js");

require("dotenv").config();
const { TOKEN, DATABASETOKEN } = process.env;

const mongoose = require("mongoose");
const { connect } = require("mongoose");

mongoose.set("strictQuery", false);

// Client intents
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [
        Discord.Partials.Message,
        Discord.Partials.Channel,
        Discord.Partials.Reaction,
        Discord.Partials.GuildMember,
        Discord.Partials.User],
});

// Load handlers
let handlers = ["commandHandler", "eventHandler"];
handlers.forEach(handler => {
    require(`./Handlers/${handler}`)(client)
});

// Connect to mongoose DataBase
(async () => {
    await connect(DATABASETOKEN).catch(console.error);
    console.log(` | Bot connected to DataBase`)
})();

// Connect Bot to Discord
client.login(TOKEN);