// Command to stop member of the week tournament. It sends leaderboard of the tournament and then deletes all the mow_points and vote status from the database

const { Command, CommandType, MessageEmbed } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const { PermissionFlagsBits } = require('discord.js');
const mowTournamentStatus = require('../utils/mowTournamentStatus');
const xpConfig = require('../schemas/xpConfig');

new Command({
    name: 'stopmow',
    description: 'Stops the member of the week tournament',
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    type: [CommandType.SLASH],
    run: async (ctx) => {
        try {
            await ctx.deferReply();

            console.log(await mowTournamentStatus())
            if (await mowTournamentStatus() === false) {
                return ctx.editReply({ content: 'Member of the week tournament has not started yet' });
            }

            // Get all users sorted by mow_points in descending order
            const users = await xpUser.find({ mow_points: { $exists: true } }).sort({ mow_points: -1 });

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
            // Go through each user and delete their mow_points and voted fields if exist
            await xpUser.updateMany({}, { $unset: { mow_points: "", voted: "", votes: "" } })
                .then(() => {
                    console.log('Fields removed from all users successfully');
                })
                .catch(err => {
                    console.error(err);
                    return ctx.channel.send({ content: 'An error occurred while trying to stop the member of the week tournament' });
                });

            const xpConfigDoc = await xpConfig.findById('config');
            if (xpConfigDoc) {
                xpConfigDoc.mowTournamentStatus = false;
                await xpConfigDoc.save();
            } else {
                await xpConfig.create({ _id: 'config', mowTournamentStatus: false });
            }

            return ctx.channel.send({ content: 'Member of the week tournament has stopped' });
        } catch (err) {
            console.error(err);
            return ctx.channel.send({ content: 'An error occurred while trying to stop the member of the week tournament' });
        }

    }
});