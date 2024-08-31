// Command that lets people vote for other people only once. The person whos getting the role gets 10 mowpoint
const { Command, CommandType, Argument, ArgumentType, MessageEmbed } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const mowTournamentStatus = require('../utils/mowTournamentStatus');

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
            if (await mowTournamentStatus() === false) {
                return ctx.reply({ content: 'This command is only available during member of the week competitions!', ephemeral: true });
            }

            // Extract the user from the arguments
            const userArg = ctx.arguments.getUser('user');
            // Set the user to the author if no user is provided in argument
            const user = userArg ? await ctx.guild.members.fetch(userArg.id) : ctx.member;

            // Get voters xp profile
            const voterXPProfile = await xpUser.findById(`${ctx.user.id}_${ctx.guild.id}`);

            if (user.id === ctx.member.id) {
                voterXPProfile.mow_points -= 1;
                try {
                    await voterXPProfile.save();

                    const embed = new MessageEmbed()
                        .setTitle('You really thought')
                        .setDescription('-1 point for even trying')
                        .setImage('https://media1.tenor.com/m/w0dZ4Eltk7IAAAAC/vuknok.gif')
                        .setColor('#FFBF00')
                        .setTimestamp();
                    return ctx.reply({ embeds: [embed] });
                } catch (err) {
                    console.error(err);
                    ctx.reply({ content: 'An error occurred, try again in a bit', ephemeral: true });
                }
            }

            if (voterXPProfile.voted) {
                const embed = new MessageEmbed()
                    .setTitle('Nuh uh')
                    .setDescription('<a:finger_wave:1279223856892084265> You have already voted for someone this week')
                    .setColor('#FFBF00')
                    .setTimestamp();
                return ctx.reply({ embeds: [embed] });
            }

            // Get the user's xp profile
            const userXPProfile = await xpUser.findById(`${user.id}_${ctx.guild.id}`);

            if (!userXPProfile) {
                return ctx.reply({ content: 'This person needs to send a message first', ephemeral: true }); 
            }

            // Add 10 mowpoints to the user
            userXPProfile.mow_points = userXPProfile.mow_points ? userXPProfile.mow_points + 10 : 10
            // Set the user's voted to true
            voterXPProfile.voted = true;
            // Save the voters and user's profile to the database
            await voterXPProfile.save();
            await userXPProfile.save();

            // Send a message to the user
            const embed = new MessageEmbed()
                .setTitle('Wooo')
                .setDescription(`You're so kind <a:pleadcry:1279219431452704839>. <@${user.id}> has received 10 points.`)
                .setColor('#FFBF00')
                .setTimestamp();
            ctx.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            ctx.reply({ content: 'An error occurred while trying to vote for the user' });
        }
    }
});
