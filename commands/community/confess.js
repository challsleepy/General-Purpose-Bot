/**
 * Command to send an anonymous message to the channel, useful for "confessions".
 *
 */
const { Command, CommandType, Argument, ArgumentType } = require('gcommands');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json')

new Command({
    name: 'confess',
    description: 'Confess anonymously',
    type: [CommandType.SLASH],
    arguments: [
        new Argument({
            name: 'confession',
            description: '👀',
            type: ArgumentType.STRING,
            required: true
        }),
    ],

    run: async (ctx) => {
        try {
            if (ctx.channel.id !== config.discord.confessionsChannelId) {
                return ctx.reply({ content: `This command can only be used in <#${config.discord.confessionsChannelId}>.`, ephemeral: true });
            }
            // Defer the reply so the user doesn't see the typing indicator
            await ctx.deferReply({ ephemeral: true })

            const content = ctx.arguments.getString('content');

            const ventEmbed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(`CONFESSION`)
                .setDescription(`*${content}*`)
                .setFooter({ text: "Anonymous", iconURL: ctx.client.user.displayAvatarURL() })
                .setTimestamp()

            // Send the embed to the channel
            await ctx.interaction.channel.send({
                embeds: [ventEmbed],
                ephemeral: false,
            });

            // Let the user know that the message has been sent
            ctx.editReply("Your confession has been sent!")

        } catch (error) {
            // Handle any errors that occur
            console.error(' Error handling document:', error);
            await ctx.interaction.reply({ content: ' Error occurred during confession.', ephemeral: true });
        }
    }
})

