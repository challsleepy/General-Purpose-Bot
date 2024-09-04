// Check if discord message is deleted is by user id 1276867467708207114, then send webhook message with same avatar and content
const { Listener } = require('gcommands');

new Listener({
    name: 'James',
    event: 'messageDelete',

    run: async ctx => {
        if (ctx.member.id === "1276867467708207114") {
            // Check if webhook exists and create it if it doesn't (with same avatar and name)
            const webhook = await ctx.channel.fetchWebhooks();
            let suggestionWebhook = webhook.find(webhook => webhook.name === ctx.member.displayName);
            if (!suggestionWebhook) {
                console.log(ctx.member.displayName)
                suggestionWebhook = await ctx.channel.createWebhook(ctx.member.displayName, {
                    avatar: ctx.member.displayAvatarURL(),
                    channel: ctx.channel.id
                });
            }
            // Send the message through webhook
            await suggestionWebhook.send({
                content: ctx.content,
                username: ctx.member.displayName,
                avatarURL: ctx.member.displayAvatarURL()
            });
        }
    }
})