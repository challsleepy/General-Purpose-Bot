const { Listener } = require('gcommands');
const config = require('../config.json');

new Listener({
    name: 'Suggestion Send',
    event: 'messageCreate',

    run: async ctx => {
        if (ctx.author.bot) return;
        console.log(ctx.channel.id === config.discord.suggestionsChannelId)
        if (ctx.channel.id === config.discord.suggestionsChannelId) {
            // Check if message starts a thread
            if (ctx.thread) return;
            try {
                await ctx.delete();
                const message = await ctx.channel.send({
                    embeds: [{
                        description: ctx.content,
                        color: 0xFFFFFF,
                        footer: {
                            text: 'Upvote with ✅. Downvote with ❌.'
                        },
                        author: {
                            name: ctx.author.username,
                            icon_url: ctx.author.displayAvatarURL()
                        }
                    }]
                });
                message.react('✅');
                message.react('❌');
            } catch (error) {
                console.error('Error sending suggestion:', error);
            }
        }
    }
})