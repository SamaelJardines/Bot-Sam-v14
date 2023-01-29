const { model, Schema } = require("mongoose");

// Schema per Guild (Discord Server)
const guildSchema = new Schema({

    // ID Schema
    _id: Schema.Types.ObjectId,

    // Guild ID to identify data per server
    Guild: String,

    // Sub Document where we will store channel IDs
    Channels: {
        suggestChannel: String
    }
    // This will make Channels Sub Document visible though are empty
}, { minimize: false });

// Export Schema Model
module.exports = model("Guild", guildSchema, "guilds");