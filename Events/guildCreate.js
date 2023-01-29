const Schema = require("../Models/guildSchema");
const mongoose = require("mongoose");

// This event will be executed when Client has been added to a Server (Bot)
module.exports = {
    name: "guildCreate",

   async execute (guild) {

    // Lookup data in DataBase and set variable with data
    let guildSavedSchema = await Schema.findOne({ Guild: guild.id });

        // If server has no data stored in DataBase = Create
        if (!guildSavedSchema) {
            guildSavedSchema = new Schema({

                // ID Schema in DataBase
                _id: mongoose.Types.ObjectId(),

                // Guild ID to identify data per server
                Guild: guild.id,

                // Sub Document where we will store channel IDs
                Channels: {
                
                }
            });
            // Save Schema
            await guildSavedSchema.save().catch(console.error);

        // If server has data stored in DataBase = Return
        } else
            return
    }
}