// // Check if discord message is deleted is by user id 1276867467708207114, then send webhook message with same avatar and content
// const { Listener } = require('gcommands');
// const { WebhookClient } = require('discord.js')

// new Listener({
//     name: 'James',
//     event: 'messageDelete',

//     run: async ctx => {
//         if (ctx.member.id === "1276867467708207114" || ctx.member.id === "1220936359397822485" || ctx.member.id === "1265921550029164544") {
//             // Check if webhook exists and create it if it doesn't (with same avatar and name)
//             let jamesWebhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1280965607818268786/AxtekFIux2x2NPpwvD5EeglIFmZxezB4BAkTHTPWm26hxz8vbHJc0EtQLeYvpo1032a5" })
//             console.log(jamesWebhook.id)
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