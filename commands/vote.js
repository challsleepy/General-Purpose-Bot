// Command that lets people vote for other people only once. The person whos getting the role gets 10 mowpoint
const { Command, CommandType, Argument, ArgumentType, MessageEmbed } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const mowTournamentStatus = require('../utils/mowTournamentStatus');
const config = require('../config.json');

new Command({
    name: 'vote',
    description: 'Vote for someone to get 10 points',
    type: [CommandType.SLASH],
    arguments: [
        new Argument({
            name: 'user',
            description: 'User to vote for',
            type: ArgumentType.USER,
            required: true
        })
    ],
    run: async (ctx) => {
        try {
            await ctx.deferReply();
            if (await mowTournamentStatus() === false) {
                return ctx.editReply({ content: 'This command is only available during member of the week competitions!', ephemeral: true });
            }

            // Extract the user from the arguments
            const userArg = ctx.arguments.getUser('user');
            // Set the user to the author if no user is provided in argument
            const user = userArg ? await ctx.guild.members.fetch(userArg.id) : ctx.member;

            // Get voters xp profile
            const voterXPProfile = await xpUser.findById(`${ctx.user.id}_${ctx.guild.id}`);

            if (user.id === ctx.member.id) {
                voterXPProfile.mowPoints = voterXPProfile.mowPoints ? voterXPProfile.mowPoints - 5 : -5;
                try {
                    await voterXPProfile.save();

                    const embed = new MessageEmbed()
                        .setTitle('You really thought')
                        .setDescription('-5 points for even trying')
                        .setImage('https://media1.tenor.com/m/w0dZ4Eltk7IAAAAC/vuknok.gif')
                        .setColor('#FFBF00')
                        .setTimestamp();
                    return ctx.editReply({ embeds: [embed] });
                } catch (err) {
                    console.error(err);
                    ctx.editReply({ content: 'An error occurred, try again in a bit', ephemeral: true });
                }
            }

            if (voterXPProfile.votesLeft === 0) {
                const embed = new MessageEmbed()
                    .setTitle('Nuh uh')
                    .setDescription('<a:finger_wave:1279526590811865120> You have used up your votes for today')
                    .setColor('#FFBF00')
                    .setTimestamp();
                return ctx.editReply({ embeds: [embed] });
            }

            if (voterXPProfile.votedMembers && voterXPProfile.votedMembers.includes(user.id)) {
                const embed = new MessageEmbed()
                    .setTitle('Nuh uh')
                    .setDescription('<a:finger_wave:1279526590811865120> You have already voted for this person today')
                    .setColor('#FFBF00')
                    .setTimestamp();
                return ctx.editReply({ embeds: [embed] });
            }

            // Get the user's xp profile
            const userXPProfile = await xpUser.findById(`${user.id}_${ctx.guild.id}`);

            if (!userXPProfile) {
                return ctx.editReply({ content: 'This person needs to send a message first', ephemeral: true }); 
            }

            // Add 10 mowpoints to the user
            userXPProfile.mowPoints = userXPProfile.mowPoints ? userXPProfile.mowPoints + 10 : 10
            // Add 1 vote to the user
            userXPProfile.votes = userXPProfile.votes ? userXPProfile.votes + 1 : 1;
            // Add the vote user's ID to the voter's votedMembers array. Check if array exists first
            voterXPProfile.votedMembers = voterXPProfile.votedMembers ? voterXPProfile.votedMembers.concat(user.id) : [user.id];
            // Remove 1 vote from the voter
            voterXPProfile.votesLeft = voterXPProfile.votesLeft ? voterXPProfile.votesLeft - 1 : config.discord.voteCount - 1;
            // Save the voters and user's profile to the database
            await voterXPProfile.save();
            await userXPProfile.save();

            // Send a message to the user
            const embed = new MessageEmbed()
                .setTitle('Wooo')
                .setDescription(`You're so kind <a:pleadcry:1279526558855598184>. <@${user.id}> has received 10 points.`)
                .setColor('#FFBF00')
                .setTimestamp();
            ctx.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            return ctx.channel.send({ content: 'An error occurred while trying to vote for the user' });
        }
    }
});
