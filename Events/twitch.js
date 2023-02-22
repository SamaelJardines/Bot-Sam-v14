const { EmbedBuilder } = require("discord.js");
const Schema = require("../Models/guildSchema");
const apiSchema = require("../Models/apiSchema");

require("dotenv").config();
const { TWITCHCLIENTID, TWITCHCLIENTSECRET } = process.env;

module.exports = {
    name: "ready",

    async execute (guild, client) {

        // Find data in DataBase and set variable to use in api request
        let apiSavedSchema = await apiSchema.findOne();

        setInterval(async function() {
            // Send api post each 1 hour to get token
            fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCHCLIENTID}&client_secret=${TWITCHCLIENTSECRET}&grant_type=client_credentials`, {
                method: 'POST',
                headers: {
                    "Client-ID": TWITCHCLIENTID,
                    "Client-Secret": TWITCHCLIENTSECRET,
                    grant_type: "client_credentials"
                }
            })
            .then(res => res.json())
            .then(async res => {
                // Save Twitch Api in DataBase
                await apiSavedSchema.updateOne({ 
                    $set: { TwitchApi: res.access_token }
                });
            });
        }, 60 * 60 * 1000);

        // Set variable for User loop
        let u = 0;
        // Set variable for Guild loop
        let g = 0;

        // Call function each 120s
        setInterval(intervalFunction, 120000);

        async function intervalFunction() {
            // Get all guilds saved in cache
            let ID = client.guilds.cache.map(guild => guild.id);

            // Lookup data in DataBase and set variable with data
            let guildSavedSchema = await Schema.findOne({ Guild: ID[g] });

            // If channel aren't saved in DataBase and Guild isn't the last = Increase guild variable and call function to check new Streams
            if (!guildSavedSchema.Channels.socialMediaChannel && ID.length-1 !== g) {
                g++;
                intervalFunction();
                return

            // If channel aren't saved in DataBase and Guild is the last
            } else if (!guildSavedSchema.Channels.socialMediaChannel && ID.length-1 === g) {
                // Clear guild variable
                g = 0;
                return

            }

            // If there isn't a Streamer Name saved in DataBase and Guild isn't the last = Increase guild variable and call function to check new Streams
            if (!guildSavedSchema.Streamers[0] && ID.length-1 !== g) {
                g++;
                intervalFunction();
                return

            // If there isn't a Streamer Name saved in DataBase and Guild is the last
            } else if (!guildSavedSchema.Streamers[0] && ID.length-1 === g) {
                // Clear guild variable
                g = 0;
                return

            }

            // Set variable with Streamer Name from the DataBase
            const user = guildSavedSchema.Streamers[u].Name;
            // Set variable with Streamer Description from the DataBase
            const description = guildSavedSchema.Streamers[u].Description;
            // Set variable with Recently Stream Name from the DataBase
            const latestStream = guildSavedSchema.Streamers[u].latestStream;

            function Loop() {
                // If Streamers saved in DataBase isn't the max = Call function to check new Streams
                if (guildSavedSchema.Streamers.length-1 !== u) {
                    u++;
                    intervalFunction();
                    return
                }

                // If Streamers saved in DataBase are the max and Guild isn't the last = Increase guild variable and call function to check new Streams
                if (guildSavedSchema.Streamers.length-1 === u && ID.length-1 !== g) {
                    u = 0;
                    g++;
                    intervalFunction();
                    return

                // If Streamers saved in DataBase are the max and Guild is the last = Clear User variable and Guild variable
                } else if (guildSavedSchema.Streamers.length-1 === u && ID.length-1 === g) {
                    u = 0;
                    g = 0;
                    return

                }
            }

            // Fetch Twitch channel
            fetch(`https://api.twitch.tv/helix/users?login=${user}`, {
                method: "GET",
                headers: {
                    "Client-ID": TWITCHCLIENTID,
                    Authorization: `Bearer ${apiSavedSchema.TwitchApi}`
                }
            })
            .then(res => res.json())
            .then(res => {

                // Fetch Twitch channel Streams
                fetch(`https://api.twitch.tv/helix/streams?user_login=${user}`, {
                    method: "GET",
                    headers: {
                        "Client-ID": TWITCHCLIENTID,
                        Authorization: `Bearer ${apiSavedSchema.TwitchApi}`
                    }
                })
                .then(res2 => res2.json())
                .then(async res2 => {

                    // If Streamer is offline
                    if (res2.data[0] === undefined) {
                        // Call function loop
                        Loop();
                        return
                    }

                    // Set variable with Streamer Profile Pic
                    const avatar = res.data[0].profile_image_url;
                    // Set variable with Streamer Name
                    const streamerName = res.data[0].display_name;
                    // Set variable with Title Stream
                    const title = res2.data[0].title;
                    // Set variable with Game tream
                    const game = res2.data[0].game_name;
                    // Set variable with Viewer Count
                    const viewers = res2.data[0].viewer_count;

                    // Get cache from channel saved in DataBase and set variable
                    const socialMediaChannelSend = guild.channels.cache.get(guildSavedSchema.Channels.socialMediaChannel);

                    // If Stream Title saved in DataBase is same the last Title Stream
                    if (latestStream == title) {
                        // Call function loop
                        Loop();
                        return
                    }

                    // Create Streamer notify embed
                    const streamerEmbed = new EmbedBuilder()
                        .setColor("#6441A4")
                        .setTitle(`${title}`)
                        .setThumbnail(`${avatar}`)
                        .setURL(`https://www.twitch.tv/${streamerName.toLowerCase()}`)
                        .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamerName.toLowerCase()}-640x480.jpg`)
                        .setAuthor({
                            name: `${streamerName}`,
                            iconURL: `${avatar}`
                        })
                        .addFields([{
                            name: "**Game**",
                            value: `${game}`,
                            inline: true
                        }])
                        .addFields([{
                            name: "**Viewers**",
                            value: `${viewers}`,
                            inline: true
                        }])

                    // If Description for notify aren't saved in DataBase
                    if (!description) {
                        // Send Embed without Description
                        await socialMediaChannelSend.send({ embeds: [streamerEmbed] });
                        // Save Streamer name and Stream Title in DataBase
                        await guildSavedSchema.updateOne({
                            $set: { [`Streamers.${u}`]: { Name: user, latestStream: title }}
                        });
                        // Call function loop
                        Loop();
                        return

                    // If Description are saved in DataBase to notify
                    } else
                        // Send Embed with Description
                        await socialMediaChannelSend.send({ content: `${description}`, embeds: [streamerEmbed] });
                        // Save Streamer name, Streamer Description and Stream Title in DataBase
                        await guildSavedSchema.updateOne({
                            $set: { [`Streamers.${u}`]: { Name: user, Description: description, latestStream: title }}
                        });
                        // Call function loop
                        Loop();
                        return

                });
            });
        }
    }
}