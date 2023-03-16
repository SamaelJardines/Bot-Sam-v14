const Discord = require("discord.js");
const { PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const Schema = require("../../Models/guildSchema");

// Command to set channel / Remove channel / Accept suggest / Deny suggest
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('suggestmod')
        .setDescription('Edit a suggestion.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Manageinteractions)
        .addSubcommandGroup(subcommandgroup => 
            subcommandgroup
                .setName('channel')
                .setDescription('Set or remove a suggest channel.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('set')
                        .setDescription('Set a suggest channel.')
                        .addChannelOption(option =>
                            option
                                .setName('set')
                                .setDescription('Suggest channel.')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(true))
                        )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('remove')
                        .setDescription('Remove suggest channel.')
                        )
                )
        .addSubcommandGroup(subcommandgroup => 
            subcommandgroup
                .setName('suggest')
                .setDescription('Accept or deny a suggestion.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('accept')
                        .setDescription('Accept a suggest.')
                        .addStringOption(option =>
                            option
                                .setName('idaccept')
                                .setDescription('Suggestion message ID to accept.')
                                .setRequired(true))
                        .addStringOption(option =>
                            option
                                .setName('comment')
                                .setDescription('Specify why you accept this suggestion.')
                                .setRequired(true))
                        )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('deny')
                        .setDescription('Deny a suggest.')
                        .addStringOption(option =>
                            option
                                .setName('iddeny')
                                .setDescription('Suggestion message ID to deny.')
                                .setRequired(true))
                        .addStringOption(option =>
                            option
                                .setName('reason')
                                .setDescription('Specify why you deny this suggestion.')
                                .setRequired(true))
                        )
                ),
  
      async execute (interaction) {

        const { options } = interaction;
        
        // Get channel ID that we want to set
        const suggestChannelSet = options.getChannel("set");

        // Get suggest message ID that we want to accept
        const suggestAccept = options.getString("idaccept");
        // Get comment to accepted suggest
        const suggestAcceptComment = options.getString("comment");

        // Get suggest message ID that we want to deny
        const suggestDeny = options.getString("iddeny");
        // Get reason to denied suggest
        const suggestDenyReason = options.getString("reason");

        // Set variable to use in switch case
        const subCommandGroup = options.getSubcommandGroup();

        // Lookup data in DataBase and set variable with data
        let guildSavedSchema = await Schema.findOne({ Guild: interaction.guild.id });

        // Find file language selected in database
        const lang = require(`../../Languages/${guildSavedSchema.Language}/commands/suggests/suggestMod.json`);

        // Get cache from channel saved in DataBase and set variable
        const suggestChannelSend = interaction.guild.channels.cache.get(guildSavedSchema.Channels.suggestChannel);
        
        try {
            switch (subCommandGroup) {
                case "channel": {
                    // Command Set Channel ID
                    if (options.getSubcommand() === "set") {
                        // If channel aren't saved in DataBase = Update DataBase with Channel ID
                        if (!guildSavedSchema.Channels.suggestChannel) {
                            // Save Channel ID in DataBase
                            await guildSavedSchema.updateOne({ 
                                $set: { Channels: { suggestChannel: suggestChannelSet.id }}
                            });
                            // Send message reply if channel correctly set
                            interaction.reply({ content: `${lang.Channel.Set.Success.Set} ${suggestChannelSet}`, ephemeral: true });

                        } else
                            // Send message reply if there is already a channel ID saved in DataBase
                            interaction.reply({ content: `${lang.Channel.Set.Error.Set} <#${guildSavedSchema.Channels.suggestChannel}>.`, ephemeral: true });
                            return
                    }

                    // Command Remove Channel ID
                    if (options.getSubcommand() === "remove") {
                        // If server has channel ID stored in DataBase = Delete
                        if (guildSavedSchema.Channels.suggestChannel) {
                            // Delete Channel ID in DataBase
                            await guildSavedSchema.updateOne({
                                Channels: { $unset: { suggestChannel: "" }}
                            });
                            // Send message reply if channel correctly removed
                            interaction.reply({ content: `${lang.Channel.Remove.Success.Remove}`, ephemeral: true });

                        } else
                            // Send message reply if there isn't a channel ID saved in DataBase
                            interaction.reply({ content: `${lang.Channel.Remove.Error.Remove}`, ephemeral: true });
                            return
                    }

                }

                    break;
                case "suggest": {
                    // Command Accept Suggest
                    if (options.getSubcommand() === "accept") {
                        // Get message what will accepted with the message ID and set variable
                        const editEmbedAccept = await suggestChannelSend.messages.fetch(suggestAccept);
                        // Get Data from message ID
                        const dataAccept = editEmbedAccept.embeds[0];

                            // Create message embed with data and accepted options
                            const acceptEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setDescription(dataAccept.description)
                                .setTimestamp(new Date(dataAccept.timestamp))
                                .setAuthor(dataAccept.author)
                                .setFooter({
                                    text: `${lang.Suggest.Accept.Embed.Footer} ${interaction.user.tag}`,
                                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                                })
                                .addFields([{
                                    name: `${lang.Suggest.Accept.Embed.Fields.FieldOne.Name}`,
                                    value: `${suggestAcceptComment}`
                                    }])
                                .addFields([{
                                    name: `${lang.Suggest.Accept.Embed.Fields.FieldTwo.Name}`,
                                    value: `${lang.Suggest.Accept.Embed.Fields.FieldTwo.Value}`
                                }])

                            // Edit old embed
                            editEmbedAccept.edit({ embeds: [acceptEmbed] });

                            // Send message if embed was been correctly accepted
                            interaction.reply({ content: `${lang.Suggest.Accept.Success.Accept}`, ephemeral: true });
                    }

                    // Command Deny Suggest
                    if (options.getSubcommand() === "deny") {
                        // Get message what will denied with the message ID and set variable
                        const editEmbedDeny = await suggestChannelSend.messages.fetch(suggestDeny);
                        // Get Data from message ID
                        const dataDeny = editEmbedDeny.embeds[0];

                            // Create message embed with data and denied options
                            const denyEmbed = new EmbedBuilder()
                                .setColor('#FF0000')
                                .setDescription(dataDeny.description)
                                .setTimestamp(new Date(dataDeny.timestamp))
                                .setAuthor(dataDeny.author)
                                .setFooter({
                                    text: `${lang.Suggest.Deny.Embed.Footer} ${interaction.user.tag}`,
                                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                                })
                                .addFields([{
                                    name: `${lang.Suggest.Deny.Embed.Fields.FieldOne.Name}`, 
                                    value: `${suggestDenyReason}`
                                }])
                                .addFields([{
                                    name: `${lang.Suggest.Deny.Embed.Fields.FieldTwo.Name}`,
                                    value: `${lang.Suggest.Deny.Embed.Fields.FieldTwo.Value}`
                                }])

                            // Edit old embed
                            editEmbedDeny.edit({ embeds: [denyEmbed] });

                            // Send message if embed was been correctly denied
                            interaction.reply({ content: `${lang.Suggest.Deny.Success.Deny}`, ephemeral: true });
                    }

                }

                    break;
            }
        } catch (err) {
            // Send message if occurred an error
            interaction.reply({ content: `Error: ${err.message}`, ephemeral: true });
            return
        }
    }
}