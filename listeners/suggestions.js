const { Listener, Context } = require('gcommands');
const config = require('../config.json');
const { Context } = require('gcommands/dist/index');


new Listener({
    name: 'Suggestion Send',
    event: 'messageCreate',

    run: async ctx => {
        if (ctx.author.bot) return;
        if (ctx.channel.id === config.suggestionsChannelId) {
            try {
                const message = await ctx.send({
                    embeds: [{
                        description: ctx.message.content,
                        color: 0x00ff00, // green color
                        footer: {
                            text: 'React with ✅ for yes or ❌ for no'
                        }
                    }]
                });
                await message.react('✅');
                await message.react('❌');
                await ctx.delete();
            } catch (error) {
                console.error('Error sending suggestion:', error);
            }
        }
    }
})