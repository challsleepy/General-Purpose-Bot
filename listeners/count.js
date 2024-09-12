// Listener for messageCreate. It is a counting game. If message/number is next in the sequence (checked from db). It will increment the number and send a message. If not, it will send a message that the number is wrong. If the message author is equal to previous message author in db. Then just delete message
const { Listener } = require('gcommands');
const { WebhookClient } = require('discord.js');
const config = require('../config.json');
const CountStateSchema = require('../schemas/countStateSchema');
const CountUserSchema = require('../schemas/countUserSchema');

new Listener({
    name: 'Counting Game',
    event: 'messageCreate',

    run: async ctx => {
        if (ctx.author.bot) return;
        if (ctx.channel.id === config.discord.countChannelId) {
            try {
                let count = await CountStateSchema.findById('config');

                if (!count) {
                    count = new CountStateSchema({
                        _id: 'config',
                        currentCount: 0,
                        currentCountAuthorId: ''
                    });
                    await count.save();
                }

                if (count.currentCountAuthorId === ctx.author.id) {
                    await ctx.delete();
                    return;
                }

                if (count.currentCount + 1 === parseInt(ctx.content)) {

                    let countUserDoc = await CountUserSchema.findById(ctx.author.id);
                    if (!countUserDoc) {
                        countUserDoc = new CountUserSchema({
                            _id: ctx.author.id,
                            displayName: ctx.member.displayName,
                            totalCounts: 0
                        });
                    }

                    countUserDoc.displayName = ctx.member.displayName;
                    countUserDoc.totalCounts++;
                    count.currentCount = parseInt(ctx.content);
                    count.currentCountAuthorId = ctx.author.id;
                    await countUserDoc.save();
                    await count.save();
                    await ctx.delete();

                    const countWebhook = new WebhookClient({ url: config.discord.countChannelWebhook });

                    await countWebhook.send({
                        content: `${count.currentCount}`,
                        username: ctx.member.displayName,
                        avatarURL: ctx.member.displayAvatarURL()
                    });

                } else {
                    await ctx.delete();
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
})