// ? Have to add feature to let people see others' rank
const { Command, CommandType } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const generateRankCard = require('../utils/rankCardGenerator');

new Command({
    name: 'rank',
    description: 'Shows your server rank',
    type: [CommandType.SLASH],
    // The function thats executed when the user uses the command.
    run: async (ctx) => {
        // Check if user exists in the database
        const user = await xpUser.findById(`${ctx.member.id}_${ctx.guild.id}`);
        if (!user) {
            return ctx.send('You have no rank yet!');
        }

        const rankBuffer = await generateRankCard(ctx.member.id, ctx.guild.id, ctx.member.displayHexColor);

        // Send the rank card to the user
        await ctx.reply({
            files: [{
                attachment: rankBuffer,
                name: 'rank.png'
            }]
        });

    }
});