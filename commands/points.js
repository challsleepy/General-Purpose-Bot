const { Command, CommandType, Argument, ArgumentType, MessageEmbed } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const mowTournamentStatus = require('../utils/mowTournamentStatus');

new Command({
    name: 'points',
    description: 'Shows your points',
    type: [CommandType.SLASH],
    arguments: [
        new Argument({
            name: 'user',
            description: 'User to check points',
            type: ArgumentType.USER,
            required: false
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

            const userXPProfile = await xpUser.findById(`${user.id}_${ctx.guild.id}`);

            if (!userXPProfile || !userXPProfile.mow_points) {
                if (user.id !== ctx.user.id) {
                    return ctx.reply({ content: 'This person doesnt have any points :sob:' });
                } else {
                    return ctx.reply({ content: 'You dont have any points. Stop slacking' });
                }
            }

            const embed = new MessageEmbed()
                .setTitle('Points')
                .setDescription(`<:purplecandy:1279200461936918578> You've got ${userXPProfile.mow_points.toFixed(2)} points! <:cyancandy:1279200429594644562>`)
                .setImage('https://media.tenor.com/x5jwK4cZEnsAAAAM/pepe-hype-hands-up.gif')
                .setColor('#FFBF00')
                .setTimestamp();

            if (user.id !== ctx.user.id) {
                embed.setDescription(`<:purplecandy:1279200461936918578> <@${user.id}> has ${userXPProfile.mow_points.toFixed(2)} points! <:cyancandy:1279200429594644562>`);
            }

            await ctx.reply({ embeds: [embed] })

            if (userXPProfile.mow_points < 0) {
                setTimeout(() => {
                    ctx.channel.send({ content: 'Oh wait..youre in the negatives... :joy::index_pointing_at_the_viewer:' });
                }, 3000);
            }

        } catch (err) {
            console.error(err);
            ctx.reply({ content: 'An error occurred while trying to get your points' });
        }
    }
});