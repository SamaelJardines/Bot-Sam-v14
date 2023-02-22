const { model, Schema } = require("mongoose");

// Schema per Guild (Discord Server)
const guildSchema = new Schema({

    // ID Schema
    _id: Schema.Types.ObjectId,

    // Guild ID to identify data per server
    Guild: String,

    // Streamers Array where we will save some Data to Notify
    Streamers: [
        {
            // Streamer Channel Name
            Name: String,
            // Streamer Description to Notify
            Description: String,
            // Save latest Stream title to identify recently Stream
            latestStream: String,
            // Disable Array ID
            _id: false
        }
    ],

    // YouTubers Array where we will save some Data to Notify
    YouTubers: [
        {
            // YouTuber Channel Name
            Name: String,
            // YouTuber Description to Notify
            Description: String,
            // Save latest Video ID to identify recently Video
            latestVideo: String,
            // Disable Array ID
            _id: false
        }
    ],

    // Sub Document where we will store channel IDs
    Channels: {
        // Channel where we will send suggestions
        suggestChannel: String,
        // Channel where we will send notifications
        socialMediaChannel: String
    }

    // This will make Channels Sub Document visible though are empty
}, { minimize: false });

// Export Schema Model
module.exports = model("Guild", guildSchema, "guilds");