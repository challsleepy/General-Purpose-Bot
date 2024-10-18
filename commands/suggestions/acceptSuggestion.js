const { PermissionFlagsBits } = require('discord.js');
const { Command, CommandType, Argument, ArgumentType, MessageEmbed } = require('gcommands');

new Command({
    name: 'accept',
    description: 'Accepts a suggestion',
    type: [CommandType.SLASH],
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    arguments: [
        new Argument({
            name: 'message-id',
            description: 'The message ID of the suggestion to accept',
            type: ArgumentType.STRING,
            required: true
        })
    ],
    // The function thats executed when the user uses the command.
    run: async (ctx) => {
        const messageId = ctx.arguments.get('message-id').value;
        const regex = /^[0-9]{18,19}$/;
        
        if (!regex.test(messageId)) {
            return ctx.reply({ content: 'Invalid message ID', ephemeral: true });
        }
        
        const message = await ctx.channel.messages.fetch(messageId);

        if (!message) {
            return ctx.reply({ content: 'Invalid message ID', ephemeral: true });
        }

        const embed = message.embeds[0];

        // If the message does not have an embed and is not from the bot, it is not a suggestion
        if (embed && message.author.id === ctx.client.user.id) {

            // If the embed is green, the suggestion has already been accepted
            if (embed.color === 0x5bb450) {
                return ctx.reply({ content: 'This suggestion has already been accepted', ephemeral: true });
            }

            const suggestionAcceptedEmbed = new MessageEmbed(embed)
                .setColor('#5bb450')
                .setFooter({ text: 'This suggestion was accepted. Thanks!' });

            message.edit({ embeds: [suggestionAcceptedEmbed] })
            .then(async () => {
                await ctx.reply({ content: 'Suggestion accepted', ephemeral: true });
            })
        } else {
            return ctx.reply({ content: 'Invalid suggestion', ephemeral: true });
        }

    }
});
