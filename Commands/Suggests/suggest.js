const Discord = require("discord.js");
const { EmbedBuilder } = require("discord.js")
const Schema = require("../../Models/guildSchema");

// Command to send a suggest
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Suggest something.")
        .addStringOption(option => 
            option
                .setName('description')
                .setDescription('Describe your suggest.')
                .setRequired(true)),
  
      async execute (interaction) {

        const { options } = interaction;

            // Get description text for suggest
            const suggestText = options.getString("description");

            // Lookup data in DataBase and set variable with data
            let guildSavedSchema = await Schema.findOne({ Guild: interaction.guild.id });

            // Find file language selected in database
            const lang = require(`../../Languages/${guildSavedSchema.Language}/commands/suggests/suggest.json`);

            // If channel aren't saved in DataBase = Return and send message reply
            if (!guildSavedSchema.Channels.suggestChannel) {
                // Send message if aren't a channel saved in DataBase
                interaction.reply({ content: `${lang.Channel.Error.Send}`, ephemeral: true });
                return
            }

            // Get cache from channel saved in DataBase and set variable
            const suggestChannelSend = interaction.guild.channels.cache.get(guildSavedSchema.Channels.suggestChannel);
    
            // Create message embed
            const suggestEmbed = new EmbedBuilder()
                .setColor("#FFFF00")
                .setDescription(`${lang.Embed.Description}\n${suggestText}`)
                .setTimestamp(new Date())
                .setAuthor({
                    name: `${lang.Embed.Author} ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setFooter({
                    text: `${lang.Embed.Footer} ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .addFields([{
                    name: `${lang.Embed.Fields.FieldOne.Name}`, 
                    value: `${lang.Embed.Fields.FieldOne.Value}`
                }])
                
                // Send embed to channel saved in DataBase
                suggestChannelSend.send({ embeds: [suggestEmbed] });

                // Send message if embed was successfully sent to channel
                interaction.reply({ content: `✔️ | ${lang.Send.Success.Send} <#${guildSavedSchema.Channels.suggestChannel}>.`, ephemeral: true });
              
    }
   
}