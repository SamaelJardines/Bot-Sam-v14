const guildSchema = require("../Models/guildSchema");

// This event will be executed when Client has been removed from a Server (Bot)
module.exports = {
    name: "guildDelete",

   async execute (guild) {

    // Lookup data in DataBase and set variable with data
    let guildSavedSchema = await guildSchema.findOne({ Guild: guild.id });

        // If server has data stored in DataBase = Delete
        if (guildSavedSchema) {

            // Delete Schema
            await guildSavedSchema.delete().catch(console.error);

        // If server doesn't has data stored in DataBase = Return
        } else
            return  
    }
}