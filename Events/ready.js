// We need import it to use = game, streaming, listening, watching, custom and competing presence in Client (Bot)
const { ActivityType } = require("discord.js");

// This event will be executed when Client got turn on (Bot)
module.exports = {
    name: "ready",

    execute (client) {

        // Print if Client is ON (Bot)
        console.log(` | ${client.user.username} online`);

        // Set Client presence (Bot)
        client.user.setActivity({
            type: ActivityType.Streaming,
            name: "Developing",
            url: "https://www.twitch.tv/xsammd"
        });
    }
}