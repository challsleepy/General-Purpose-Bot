// // Listener to check for message edit and send webhook message with same avatar and content
// const { Listener } = require('gcommands');
// const { WebhookClient } = require('discord.js')

// new Listener({
//     name: 'Edit Listener',
//     event: 'messageCreate',

//     run: async ctx => {
//         if (ctx.member.id === "1276867467708207114") {
//             // Check if webhook exists and create it if it doesn't (with same avatar and name)
//             let jamesWebhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1280965607818268786/AxtekFIux2x2NPpwvD5EeglIFmZxezB4BAkTHTPWm26hxz8vbHJc0EtQLeYvpo1032a5" })
//             await ctx.delete();
//             // Send the message through webhook
//             await jamesWebhook.send({
//                 content: ctx.content,
//                 username: ctx.member.displayName,
//                 avatarURL: ctx.member.displayAvatarURL(),
//                 files: ctx.attachments.map(attachment => attachment.url)
//             });
//         }
//     }
// })