// Sends member of the week leaderboard. Sorted from points high to low in an embed
// Compare this snippet from commands/mowleaderboard.js:
const { Command, CommandType, MessageEmbed, Argument, ArgumentType } = require('gcommands');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const xpUser = require('../schemas/xpUser');
const mowTournamentStatus = require('../utils/mowTournamentStatus');
const countUserSchema = require('../schemas/countUserSchema');

new Command({
    name: 'leaderboard',
    description: 'Sends leaderboard',
    type: [CommandType.SLASH],
    arguments: [
        new Argument({
            name: 'type',
            description: 'Type of leaderboard',
            choices: [
                { name: 'Server', value: 'server' },
                { name: 'Member Of The Week', value: 'mow' },
                { name: 'Count', value: 'count' }
            ],
            type: ArgumentType.STRING,
            required: true,
        })
    ],
    run: async (ctx) => {
        try {
            await ctx.deferReply();

            const leaderboardType = ctx.arguments.get('type').value;
            // Send embed with link button component to https://ranks.codenchill.org
            if (leaderboardType === 'server') {
                const buttonRow = new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setLabel('Leaderboard')
                        .setURL('https://ranks.codenchill.org')
                        .setStyle(ButtonStyle.Link)
                ])

                return ctx.editReply({ content: "Check out the server leaderboard here", components: [buttonRow] });
            }

            if (leaderboardType === 'mow') {
                if (await mowTournamentStatus() === false) {
                    return ctx.editReply({ content: 'This command is only available during member of the week competitions!', ephemeral: true });
                }

                // Get all users sorted by mow_points in descending order
                const users = await xpUser.find({ mow_points: { $exists: true } }).sort({ mow_points: -1, votes: -1 });

                // Create an embed to send the leaderboard
                const embed = new MessageEmbed()
                    .setTitle('Member of the Week Leaderboard')
                    .setColor('#FFBF00')
                    .setTimestamp();

                if (!users.length) {
                    embed.setDescription('Nothing to show here yet!');
                }

                // Add the top 10 users to the embed
                for (let index = 0; index < users.length; index++) {
                    const user = users[index];
                    if (index < 10) {
                        embed.addFields({ name: `${index + 1}. ${user.displayName}`, value: `${user.mow_points.toFixed(2)} points ${user.votes ? `| ${user.votes} votes` : "| 0 votes"}` });
                    }
                }

                // Send the embed
                await ctx.editReply({ embeds: [embed] });
            }

            if (leaderboardType === "count") {
                // Get all users sorted by totalCounts in descending order. Give top 30 users. Dont use fields just use description
                const users = await countUserSchema.find({ totalCounts: { $exists: true } }).sort({ totalCounts: -1 });

                // Create an embed to send the leaderboard
                const embed = new MessageEmbed()
                    .setTitle('Count Leaderboard')
                    .setColor('#FFBF00')
                    .setTimestamp();
                
                if (!users.length) {
                    embed.setDescription('Nothing to show here yet!');
                } else {
                    embed.setDescription(
                        users.map((user, index) => `${index + 1}. <@${user._id}> - ${user.totalCounts} counts`).join('\n')
                    )
                }

                // Send the embed
                await ctx.editReply({ embeds: [embed] });
            }

        } catch (err) {
            console.error(err);
            return ctx.channel.send({ content: 'An error occurred while trying to get the leaderboard' });
        }
    }
});