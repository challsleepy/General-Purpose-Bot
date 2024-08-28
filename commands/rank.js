// ? Have to add feature to let people see others' rank
// Add additional argument to check other people's rank
const { Command, CommandType, Argument, ArgumentType } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const generateRankCard = require('../utils/rankCardGenerator');

new Command({
    name: 'rank',
    description: 'Shows your server rank',
    type: [CommandType.SLASH],
    arguments: [
        new Argument({
            name: 'user',
            description: 'User to check rank',
            type: ArgumentType.USER,
            required: false
        })
    ],
    // The function thats executed when the user uses the command.
    run: async (ctx) => {
        // Check if user exists in the database
        // Extract the user from the arguments
        const userArg = ctx.arguments.getUser('user');
        // Set the user to the author if no user is provided in argument
        const user = userArg ? await ctx.guild.members.fetch(userArg.id) : ctx.member;
        // Get the user's rank details from the database
        const userRankDetails = await xpUser.findById(`${user.id}_${ctx.guild.id}`)
        if (!userRankDetails) {
            // If the user is the author, send message about their own rank, else send message about the other user's rank
            if (user.id === ctx.member.id) {
                return ctx.reply({ content: 'You have not sent any messages yet!', ephemeral: true });
            } else {
                return ctx.reply({ content: 'This user has not sent any messages yet!', ephemeral: true });
            }
        }


        const rankBuffer = await generateRankCard(user.id, ctx.guild.id, user.displayHexColor);

        // Send the rank card to the user
        await ctx.reply({
            files: [{
                attachment: rankBuffer,
                name: 'rank.png'
            }]
        });
    }
});