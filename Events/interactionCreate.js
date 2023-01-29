// This event will be executed when Client was have a interaction (Bot)
module.exports = {
    name: "interactionCreate",
    execute (interaction, client) {
        // Get commmand interaction
        const command = client.commands.get(interaction.commandName);

        // If command exist or load correctly = Execute
        if (command) {
            command.execute(interaction, client);

        // If command doesn't exist or load failed = Return and send message reply
        } else {
            interaction.reply({ content: `❌ | This command doesn't exist or is outdated.`, ephemeral: true });
            return
        }
    }
}