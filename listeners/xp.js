const { Listener } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const { addRandomXP } = require('../utils/addRandomXP');

new Listener({
    name: 'giveXP',
    event: 'messageCreate',
    run: async ctx => {
        // If the author of the message is a bot, return
        if (ctx.author.bot) return;

        // Get the user from the database
        xpUser.findById(`${ctx.author.id}_${ctx.guild.id}`)
            .then(user => {
                // If the user is not in the database, create a new user
                if (!user) {
                    user = new xpUser({
                        _id: `${ctx.author.id}_${ctx.guild.id}`,
                        current_xp: 0,
                        current_level: 0
                    });
                }


                addRandomXP(user, ctx);

            })
    }
})