const { Command, CommandType, Argument, ArgumentType } = require('gcommands');
const { EmbedBuilder } = require('discord.js');

new Command({
    name: 'vent',
    description: 'Vent anonymously',
    type: [CommandType.SLASH],
    arguments: [
        new Argument({
            name: 'content',
            description: 'Let it all out',
            type: ArgumentType.STRING,
            required: true
        }),
    ],

    run: async (ctx) => {
        try {
            await ctx.deferReply({ ephemeral: true })

            const content = ctx.arguments.getString('content');

            const ventEmbed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(`VENT`)
                .setDescription(`*${content}*`)
                .setFooter({ text: "Anonymous", iconURL: ctx.client.user.displayAvatarURL() })
                .setTimestamp()

            await ctx.interaction.channel.send({
                embeds: [ventEmbed],
                ephemeral: false,
            });

            ctx.editReply("Your vent has been sent!")

        } catch (error) {
            // Handle any errors that occur
            console.error('⚠️ Error handling document:', error);
            await ctx.interaction.reply({ content: '⚠️ Error occurred during vent.', ephemeral: true });
        }
    }
})