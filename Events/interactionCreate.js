const Schema = require("../Models/guildSchema");

// This event will be executed when Client was have a interaction (Bot)
module.exports = {
    name: "interactionCreate",
    async execute (interaction, client) {
        // Get commmand interaction
        const command = client.commands.get(interaction.commandName);

        // Find data in DataBase and set variable with data
        let guildSavedSchema = await Schema.findOne({ Guild: interaction.guild.id });

        // Find file language selected in database
        const lang = require(`../Languages/${guildSavedSchema.Language}/events/interactionCreate.json`);

        // If interaction is from select menu
        if (interaction.isStringSelectMenu()) {
            // If interaction is from specified select menu "selectlanguage"
            if (interaction.customId === "selectlanguage") {
                // Get interaction options and set variable
                let value = interaction.values[0];

                // If interaction option specific is "US"
                if (value === "US") {
                    // If language saved in DataBase aren't "en-US" = Save language
                    if (guildSavedSchema.Language !== "en-US") {
                        // Save Language in DataBase
                        await guildSavedSchema.updateOne({ 
                            $set: { Language: "en-US" }
                        });
                        // Send message reply if language correctly saved
                        interaction.reply({ content: `${lang.Language.Success.CorrectlySelected}`, ephemeral: true });
                        return

                    } else
                        // Send message reply if language is already saved in DataBase
                        interaction.reply({ content: `${lang.Language.Error.AlreadySelected}`, ephemeral: true });
                        return
                }

                // If interaction option specific is "ES"
                if (value === "ES") {
                    // If language saved in DataBase aren't "es-ES" = Save language
                    if (guildSavedSchema.Language !== "es-ES") {
                        // Save Language in DataBase
                        await guildSavedSchema.updateOne({ 
                            $set: { Language: "es-ES" }
                        });
                        // Send message reply if language correctly saved
                        interaction.reply({ content: `${lang.Language.Success.CorrectlySelected}`, ephemeral: true });
                        return

                    } else
                        // Send message reply if language is already saved in DataBase
                        interaction.reply({ content: `${lang.Language.Error.AlreadySelected}`, ephemeral: true });
                        return
                }
            }
        }

        // If command exist or load correctly = Execute
        if (command) {
            command.execute(interaction, client);

        } else
            // If command doesn't exist or load failed = Return and send message reply
            interaction.reply({ content: `${lang.Command.Error.Outdated}`, ephemeral: true });
            return
    }
}