const { model, Schema } = require("mongoose");

const apiSchema = new Schema({

    // ID Schema
    _id: Schema.Types.ObjectId,

    // Twitch Api Key to use globally
    TwitchApi: String

});

// Export Schema Model
module.exports = model("Api", apiSchema, "apis");