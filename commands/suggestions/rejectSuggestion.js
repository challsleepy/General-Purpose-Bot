const { PermissionFlagsBits } = require('discord.js');
const { Command, CommandType, Argument, ArgumentType, MessageEmbed } = require('gcommands');

new Command({
    name: 'reject',
    description: 'Rejects a suggestion',
    type: [CommandType.SLASH],
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    arguments: [
        new Argument({
            name: 'message-id',
            description: 'The message ID of the suggestion to reject',
            type: ArgumentType.STRING,
            required: true
        }),
        new Argument({
            name: 'reason',
            description: 'The reason for rejecting the suggestion',
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
            if (embed.color === 0xff2c2c) {
                return ctx.reply({ content: 'This suggestion has already been rejected', ephemeral: true });
            }

            const suggestionAcceptedEmbed = new MessageEmbed(embed)
                .setDescription(`${embed.description}\n\n**Reason for rejection:** ${ctx.arguments.get('reason').value}`)
                .setColor('#ff2c2c')
                .setFooter({ text: 'This suggestion was rejected.' });

            message.edit({ embeds: [suggestionAcceptedEmbed] })
            .then(async () => {
                await ctx.reply({ content: 'Suggestion rejected', ephemeral: true });
            })
        } else {
            return ctx.reply({ content: 'Invalid suggestion', ephemeral: true });
        }

    }
});
