const Discord = require("discord.js");
const { PermissionFlagsBits, ChannelType } = require('discord.js');
const Schema = require("../../Models/guildSchema");
const apiSchema = require("../../Models/apiSchema");

const { TWITCHCLIENTID, YOUTUBEAPIKEY } = process.env;

// Command to set channel and remove channel / Set streamer name and remove streamer / Set youtuber name and remove youtube
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('socialmod')
        .setDescription('Set a social media')
        .setDefaultMemberPermissions(PermissionFlagsBits.Manageinteractions)
        .addSubcommandGroup(subcommandgroup => 
            subcommandgroup
                .setName('channel')
                .setDescription('Set or remove a social media channel.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('set')
                        .setDescription('Set a social media channel.')
                        .addChannelOption(option =>
                            option
                                .setName('channel')
                                .setDescription('Social media channel.')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(true))
                        )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('remove')
                        .setDescription('Remove social media channel.')
                        )
                )
        .addSubcommandGroup(subcommandgroup => 
            subcommandgroup
                .setName('twitch')
                .setDescription('Add or remove a streamer channel.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('add')
                        .setDescription('Save a twitch channel.')
                        .addStringOption(option =>
                            option
                                .setName('streamername')
                                .setDescription('Streamer name to save.')
                                .setRequired(true))
                        .addStringOption(option =>
                            option
                                .setName('streamerdescription')
                                .setDescription('Description to send in notify.'))
                        )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('remove')
                        .setDescription('Remove a twitch channel.')
                        .addStringOption(option =>
                            option
                                .setName('streamername')
                                .setDescription('Streamer name to remove.')
                                .setRequired(true))
                        )
                )
        .addSubcommandGroup(subcommandgroup => 
            subcommandgroup
                .setName("youtube")
                .setDescription("Add or remove a youtuber channel.")
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('add')
                        .setDescription('Save a youtube channel.')
                        .addStringOption(option =>
                            option
                                .setName('youtubername')
                                .setDescription('Youtuber name to save.')
                                .setRequired(true))
                        .addStringOption(option =>
                            option
                                .setName('youtuberdescription')
                                .setDescription('Description to send in notify.'))
                        )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('remove')
                        .setDescription('Remove a youtuber channel.')
                        .addStringOption(option =>
                            option
                                .setName('youtubername')
                                .setDescription('youtuber name to remove.')
                                .setRequired(true))
                        )
                ),

    async execute (interaction) {

        const { options } = interaction;

        // Get channel ID that we want to set
        const socialMediaChannelSet = options.getChannel("channel");

        // Get Streamer name that we want to set
        const streamerName = options.getString("streamername");

        // Get Streamer description that we want to set
        const streamerDescription = options.getString("streamerdescription");

        // Get YouTuber name that we want to set
        const youtuberName = options.getString("youtubername");

        // Get YouTuber description that we want to set
        const youtuberDescription = options.getString("youtuberdescription");

        // Set variable to use in switch case
        const subCommandGroup = options.getSubcommandGroup();

        // Find data in DataBase and set variable with data
        let guildSavedSchema = await Schema.findOne({ Guild: interaction.guild.id });

        try {
            switch (subCommandGroup) {
                case "channel": {
                    // Command Set Channel ID
                    if (options.getSubcommand() === "set") {
                        // If channel aren't saved in DataBase
                        if (!guildSavedSchema.Channels.socialMediaChannel) {
                            // Save Channel ID in DataBase
                            await guildSavedSchema.updateOne({ 
                                $set: { Channels: { socialMediaChannel: socialMediaChannelSet.id }}
                            });
                            // Send message reply if channel correctly set
                            interaction.reply({ content: `✔️ | Social media channel correctly set in ${socialMediaChannelSet}`, ephemeral: true });

                        } else if (guildSavedSchema.Channels.socialMediaChannel) {
                            // Send message reply if there is already a channel ID saved in DataBase
                            interaction.reply({ content: `❌ | Social media channel is already set. Current channel is <#${guildSavedSchema.Channels.socialMediaChannel}>. Remove channel to set it again.`, ephemeral: true });
                            return

                        }
                    }

                    // Command Remove Channel ID
                    if (options.getSubcommand() === "remove") {
                        // If server has channel ID stored in DataBase
                        if (guildSavedSchema.Channels.socialMediaChannel) {
                            // Delete Channel ID in DataBase
                            await guildSavedSchema.updateOne({
                                Channels: { $unset: { socialMediaChannel: "" }}
                            });
                            // Send message reply if channel correctly removed
                            interaction.reply({ content: `✔️ | Social media channel was successfully removed.`, ephemeral: true });
                            
                        } else if (!guildSavedSchema.Channels.socialMediaChannel) {
                            // Send message reply if there isn't a channel ID saved in DataBase
                            interaction.reply({ content: `❌ | There isn't channel to remove.`, ephemeral: true });
                            return

                        }
                    }

                }

                    break;
                case "twitch": {
                    // Find streamer data in DataBase and set variable with count to use in conditions
                    let chkStreamer = await Schema.findOne({ Guild: interaction.guild.id, "Streamers.Name": streamerName }).count();

                    // Find data in DataBase and set variable to use in api request
                    let apiSavedSchema = await apiSchema.findOne();

                    // Command to Add Streamer Name
                    if (options.getSubcommand() === "add") {
                        // Fetch twitch channel to confirm if exist
                        fetch(`https://api.twitch.tv/helix/users?login=${streamerName.toLowerCase()}`, {
                            method: "GET",
                            headers: {
                                "Client-ID": TWITCHCLIENTID,
                                Authorization: `Bearer ${apiSavedSchema.TwitchApi}`
                            }
                        })
                        .then(res => res.json())
                        .then(async res => {

                            // If twitch channel doesn't exist
                            if (res.data[0] === undefined) {
                                // Return message replys
                                interaction.reply({ content: `❌ | Streamer doesn't exist.`, ephemeral: true });
                                return
                            }

                            // If streamer name aren't saved in DataBase and User doesn't want to save description
                            if (!streamerDescription && chkStreamer === 0) {
                                // Save Streamer Name in DataBase
                                await guildSavedSchema.updateOne({
                                    $push: { Streamers: { Name: streamerName.toLowerCase() }}
                                });
                                // Send message reply if streamer name correctly added
                                interaction.reply({ content: `✔️ | Streamer name added correctly.`, ephemeral: true });

                            // If streamer name aren't saved in DataBase and User want to save description
                            } else if (streamerDescription && chkStreamer === 0) {
                                // Save Streamer Name and Description in DataBase
                                await guildSavedSchema.updateOne({
                                    $push: { Streamers: { Name: streamerName.toLowerCase(), Description: streamerDescription }}
                                });
                                // Send message reply if streamer name and description correctly added
                                interaction.reply({ content: `✔️ | Streamer name and description added correctly.`, ephemeral: true });

                            } else if (chkStreamer !== 0) {
                                // Send message reply if there is already a Streamer saved in DataBase
                                interaction.reply({ content: `❌ | Streamer name is already set.`, ephemeral: true });
                                return

                            }
                        });
                    }

                    // Command to Remove Streamer Name
                    if (options.getSubcommand() === "remove") {
                        // If server has Streamer name stored in DataBase
                        if (chkStreamer !== 0) {
                            // Delete Data Saved
                            await guildSavedSchema.updateOne({
                                $pull: { Streamers: { Name: streamerName }}
                            });
                            // Send message reply if streamer name correctly removed
                            interaction.reply({ content: `✔️ | Streamer name removed correctly.`, ephemeral: true });

                        } else
                            // Send message reply if there isn't a Streamer name saved in DataBase
                            interaction.reply({ content: `❌ | There isn't Streamer name to remove.`, ephemeral: true });
                            return
                    }

                }

                    break;
                case "youtube": {
                    // Lookup youtuber data in DataBase and set variable with count to use in conditions
                    let chkYouTuber = await Schema.findOne({ Guild: interaction.guild.id, "YouTubers.Name": youtuberName }).count();

                    // Command to Add YouTuber Name
                    if (options.getSubcommand() === "add") {
                        // Fetch youtube channel to confirm if exist
                        fetch(`https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBEAPIKEY}&forUsername=${youtuberName}`, {
                            method: "GET"
                        })
                        .then(res => res.json())
                        .then(async res => {

                            // If error occurred
                            if (res.error) {
                                // Return message reply
                                interaction.reply({ content: `❌ | An error occurred, please contact to developer.`, ephemeral: true });
                                return
                            }

                            // If youtube channel doesn't exist
                            if (res.pageInfo.totalResults !== 1) {
                                // Return message reply
                                interaction.reply({ content: `❌ | YouTuber doesn't exist.`, ephemeral: true });
                                return
                            }

                            // If youtuber name aren't saved in DataBase and User doesn't want to save description
                            if (!youtuberDescription && chkYouTuber === 0) {
                                // Save YouTuber Name in DataBase
                                await guildSavedSchema.updateOne({
                                    $push: { YouTubers: { Name: youtuberName }}
                                });
                                // Send message reply if youtuber name correctly added
                                interaction.reply({ content: `✔️ | YouTuber name added correctly.`, ephemeral: true });

                            // If youtuber name aren't saved in DataBase and User want to save description
                            } else if (youtuberDescription && chkYouTuber === 0) {
                                // Save YouTuber Name and Description in DataBase
                                await guildSavedSchema.updateOne({
                                    $push: { YouTubers: { Name: youtuberName, Description: youtuberDescription }}
                                });
                                // Send message reply if youtuber name and description correctly added
                                interaction.reply({ content: `✔️ | YouTuber name added correctly.`, ephemeral: true });

                            } else if (chkYouTuber !== 0) {
                                // Send message reply if there is already a YouTuber name saved in DataBase
                                interaction.reply({ content: `❌ | YouTuber name is already set.`, ephemeral: true });
                                return

                            }

                        });
                    }

                    // Command to Remove YouTuber Name
                    if (options.getSubcommand() === "remove") {
                        // If server has YouTuber name stored in DataBase
                        if (chkYouTuber !== 0) {
                            // Delete Data Saved
                            await guildSavedSchema.updateOne({
                                $pull: { YouTubers: { Name: youtuberName }}
                            });
                            // Send message reply if youtuber name correctly removed
                            interaction.reply({ content: `✔️ | YouTuber name removed correctly.`, ephemeral: true });

                        } else
                            // Send message reply if there isn't a YouTuber name saved in DataBase
                            interaction.reply({ content: `❌ | There isn't YouTuber name to remove.`, ephemeral: true });
                            return

                    }

                }

                    break;
            }
        } catch (err) {
            interaction.reply({ content: `Error: ${err.message}`, ephemeral: true })
            return

        }

    }
}