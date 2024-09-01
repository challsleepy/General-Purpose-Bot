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
            await ctx.deferReply();
            if (await mowTournamentStatus() === false) {
                return ctx.editReply({ content: 'This command is only available during member of the week competitions!', ephemeral: true });
            }

            // Extract the user from the arguments
            const userArg = ctx.arguments.getUser('user');
            // Set the user to the author if no user is provided in argument
            const user = userArg ? await ctx.guild.members.fetch(userArg.id) : ctx.member;

            const userXPProfile = await xpUser.findById(`${user.id}_${ctx.guild.id}`);

            if (!userXPProfile || !userXPProfile.mow_points) {
                if (user.id !== ctx.user.id) {
                    return ctx.editReply({ content: 'This person doesnt have any points :sob:' });
                } else {
                    return ctx.editReply({ content: 'You dont have any points. Stop slacking' });
                }
            }

            const embed = new MessageEmbed()
                .setTitle('Points')
                .setDescription(`<:purple_candy:1279057588822216835> You've got ${userXPProfile.mow_points.toFixed(2)} points! <:cyan_candy:1279057698482290778>`)
                .setImage('https://media.tenor.com/x5jwK4cZEnsAAAAM/pepe-hype-hands-up.gif')
                .setColor('#FFBF00')
                .setTimestamp();

            if (user.id !== ctx.user.id) {
                embed.setDescription(`<:purple_candy:1279057588822216835> <@${user.id}> has ${userXPProfile.mow_points.toFixed(2)} points! <:cyan_candy:1279057698482290778>`);
            }

            await ctx.editReply({ embeds: [embed] })

            if (user.id === ctx.user.id && userXPProfile.mow_points < 0) {
                setTimeout(async() => {
                    embed.setImage('https://media1.tenor.com/m/ASGuOCPGrKEAAAAd/kekw-kek.gif')
                    await ctx.editReply({ embeds: [embed] });
                    ctx.channel.send({ content: 'Oh wait..youre in the negatives... :joy::index_pointing_at_the_viewer:' });
                }, 3000);
            }

        } catch (err) {
            console.error(err);
            return ctx.channel.send({ content: 'An error occurred while trying to get your points' });
        }
    }
});