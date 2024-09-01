// Sends member of the week leaderboard. Sorted from points high to low in an embed
// Compare this snippet from commands/mowleaderboard.js:
const { Command, CommandType, MessageEmbed } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const mowTournamentStatus = require('../utils/mowTournamentStatus');

new Command({
    name: 'leaderboard',
    description: 'Sends member of the week leaderboard',
    type: [CommandType.SLASH],
    run: async (ctx) => {
        try {
            await ctx.deferReply();
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
                    const member = await ctx.guild.members.fetch(user._id.split('_')[0]);
                    embed.addFields({ name: `${index + 1}. ${member.displayName}`, value: `${user.mow_points.toFixed(2)} points ${user.votes ? `| ${user.votes} votes`:"| 0 votes"}` });
                }
            }

            // Send the embed
            await ctx.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return ctx.channel.send({ content: 'An error occurred while trying to get the leaderboard' });
        }
    }
});