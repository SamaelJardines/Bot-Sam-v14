const { EmbedBuilder } = require("discord.js")
const Schema = require("../Models/guildSchema");

require("dotenv").config();
const { YOUTUBEAPIKEY } = process.env;

module.exports = {
    name: "ready",

    async execute (guild, client) {

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

            // If channel aren't saved in DataBase and Guild isn't the last = Increase guild variable and call function to check new videos
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

            // If there isn't a YouTuber Name saved in DataBase and Guild isn't the last = Increase guild variable and call function to check new videos
            if (!guildSavedSchema.YouTubers[0] && ID.length-1 !== g) {
                g++;
                intervalFunction();
                return

            // If there isn't a YouTuber Name saved in DataBase and Guild is the last
            } else if (!guildSavedSchema.YouTubers[0] && ID.length-1 === g) {
                // Clear guild variable
                g = 0;
                return

            }

            // Set variable with YouTuber Name from the DataBase
            const user = guildSavedSchema.YouTubers[u].Name;
            // Set variable with YouTuber Description from the DataBase
            const description = guildSavedSchema.YouTubers[u].Description;
            // Set variable with Recently Video ID from the DataBase
            const latestVideo = guildSavedSchema.YouTubers[u].latestVideo;

            // Fetch YouTube channel
            fetch(`https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBEAPIKEY}&forUsername=${user}&part=snippet,contentDetails`, {
                method: "GET"
            })
            .then(res => res.json())
            .then(async res => {

                // If error occurred
                if (res.error) {
                    return
                }

                // Set variable with Channel ID to fetch Videos
                const userID = res.items[0].contentDetails.relatedPlaylists.uploads;

                // Fetch YouTube channel Videos
                fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBEAPIKEY}&playlistId=${userID}&part=snippet&maxResults=1`, {
                    method: "GET"
                })
                .then(res2 => res2.json())
                .then(async res2 => {

                    // If error occurred
                    if (res2.error) {
                        return
                    }

                    // Set variable with YouTuber Profile Pic
                    const avatar = res.items[0].snippet.thumbnails.default.url;
                    // Set variable with YouTuber Name
                    const youtuberName = res.items[0].snippet.title;
                    // Set variable with Title Video
                    const title = res2.items[0].snippet.title;
                    // Set variable with Video ID
                    const videoID = res2.items[0].snippet.resourceId.videoId;
                    // Set variable with Miniature Video Pic
                    const miniature = res2.items[0].snippet.thumbnails.standard.url;

                    // Get cache from channel saved in DataBase and set variable
                    const socialMediaChannelSend = guild.channels.cache.get(guildSavedSchema.Channels.socialMediaChannel);

                    function Loop() {
                        // If YouTubers saved in DataBase isn't the max = Call function to check new Videos
                        if (guildSavedSchema.YouTubers.length-1 !== u) {
                            u++;
                            intervalFunction();
                            return
                        }

                        // If YouTubers saved in DataBase are the max and Guild isn't the last = Increase guild variable and call function to check new Videos
                        if (guildSavedSchema.YouTubers.length-1 === u && ID.length-1 !== g) {
                            u = 0;
                            g++;
                            intervalFunction();
                            return

                        // If YouTubers saved in DataBase are the max and Guild is the last = Clear User variable and Guild variable
                        } else if (guildSavedSchema.YouTubers.length-1 === u && ID.length-1 === g) {
                            u = 0;
                            g = 0;
                            return

                        }
                    }

                    // If YouTube Video ID saved in DataBase is same the last YouTube Video ID
                    if (latestVideo == videoID) {
                        // Call function loop
                        Loop();
                        return
                    }

                    // Create YouTuber notify embed
                    const youtuberEmbed = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setTitle(`${title}`)
                        .setThumbnail(`${avatar}`)
                        .setURL(`https://www.youtube.com/watch?v=${videoID}`)
                        .setImage(`${miniature}`)
                        .setAuthor({
                            name: `${youtuberName}`,
                            iconURL: `${avatar}`
                        })

                    // If Description for notify aren't saved in DataBase
                    if (!description) {
                        // Send Embed without Description
                        await socialMediaChannelSend.send({ embeds: [youtuberEmbed] });
                        // Save YouTuber name and YouTube ID in DataBase
                        await guildSavedSchema.updateOne({
                            $set: { [`YouTubers.${u}`]: { Name: user, latestVideo: videoID }}
                        });
                        // Call function loop
                        Loop();
                        return

                    // If Description are saved in DataBase to notify
                    } else
                        // Send Embed with Description
                        await socialMediaChannelSend.send({ content: `${description}`, embeds: [youtuberEmbed] });
                        // Save YouTuber name, YouTuber Description and YouTube ID in DataBase
                        await guildSavedSchema.updateOne({
                            $set: { [`YouTubers.${u}`]: { Name: user, latestVideo: videoID, Description: description }}
                        });
                        // Call function loop
                        Loop();
                        return

                });
            });
        }
    }
}