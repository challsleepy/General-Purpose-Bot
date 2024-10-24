// Listener for messageCreate. It is a counting game. If message/number is next in the sequence (checked from db). It will increment the number and send a message. If not, it will send a message that the number is wrong. If the message author is equal to previous message author in db. Then just delete message
const { Listener } = require('gcommands');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const CountStateSchema = require('../schemas/countStateSchema');
const CountUserSchema = require('../schemas/countUserSchema');

const countMessedUpMessages = [
    { message: ":x: | Ofc you ruined it. Back to one we go.", action: "end-counting" },
    { message: ":x: | Bravo. That was spectacularly wrong.", action: "end-counting" },
    { message: ":x: | Nice job, genius. Let's pretend that never happened.", action: "end-counting" },
    { message: ":x: | OMG I PROMISE ITS NOT THIS HARD", action: "end-counting" },
    { message: ":x: | Nice job, genius. Let's pretend that never happened.", action: "end-counting" },
    { message: ":x: | i-...nvm", action: "end-counting" },
    { message: ":x: | bruh", action: "end-counting" },
    { message: ":x: | You’re really on a roll… a downward one. Resetting.", action: "end-counting" },
    { message: ":x: | dawg atp lemme just do it for you", action: "count" },
    { message: "<:jesus_wyd:1299004775962116148> | in a good mood today, i'll let it slide this once", action: "forgive" },
];

new Listener({
    name: 'Counting Game',
    event: 'messageCreate',

    run: async ctx => {
        if (ctx.author.bot) return;
        if (ctx.channel.id === config.discord.countChannelId) {
            try {
                let countDoc = await CountStateSchema.findById('config');

                if (!countDoc) {
                    countDoc = new CountStateSchema({
                        _id: 'config',
                        currentCount: 0,
                        currentCountAuthorId: ''
                    });
                    await countDoc.save();
                }

                let countUserDoc = await CountUserSchema.findById(ctx.author.id);
                if (!countUserDoc) {
                    countUserDoc = new CountUserSchema({
                        _id: ctx.author.id,
                        displayName: ctx.member.displayName,
                        totalCounts: 0
                    });
                }

                if (countDoc.currentCountAuthorId === ctx.author.id || countDoc.currentCount + 1 !== parseInt(ctx.content)) {
                    console.log(countDoc.currentCount + 1, parseInt(ctx.content))
                    console.log(countDoc.currentCountAuthorId === ctx.author.id, countDoc.currentCount + 1 !== parseInt(ctx.content))
                    const randomMessageAction = countMessedUpMessages[Math.floor(Math.random() * countMessedUpMessages.length)];

                    const messageEmbed = new EmbedBuilder()
                        .setColor("#ffbf00")
                        .setDescription(randomMessageAction.message)

                    if (randomMessageAction.action === "end-counting") {
                        countDoc.currentCount = 0;
                        countDoc.currentCountAuthorId = '';

                        await countDoc.save();
                        await ctx.react("❌")
                    }

                    if (randomMessageAction.action === "count") {
                        countDoc.currentCount = countDoc.currentCount + 1;
                        countDoc.currentCountAuthorId = ctx.client.user.id

                        await countDoc.save();
                        await ctx.react("❌")

                        await ctx.channel.send(`${countDoc.currentCount}`)
                    }

                    if (randomMessageAction.action === "forgive") {
                        countDoc.currentCount = countDoc.currentCount + 1;
                        countDoc.currentCountAuthorId = ctx.client.user.id;
                        countUserDoc.totalCounts = countDoc.currentCount + 1;

                        await countDoc.save();
                        await countUserDoc.save();
                    }

                    await ctx.channel.send({ embeds: [messageEmbed] })
                }

                if (countDoc.currentCount + 1 === parseInt(ctx.content)) {

                    countUserDoc.displayName = ctx.member.displayName;
                    countUserDoc.totalCounts++;
                    countDoc.currentCount = countDoc.currentCount++;
                    countDoc.currentCountAuthorId = ctx.author.id;
                    await countUserDoc.save();
                    await countDoc.save();
                    await ctx.react('✅')

                }

            } catch (error) {
                console.error(error);
            }
        }
    }
})