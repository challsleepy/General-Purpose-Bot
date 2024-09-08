// Command to start member of the week tournament. It sets the mowTournamentStatus to true in the config file

const { Command, CommandType } = require('gcommands');
const { PermissionFlagsBits } = require('discord.js');
const mowTournamentStatus = require('../utils/mowTournamentStatus');
const xpConfig = require('../schemas/xpConfig');

new Command({
    name: 'startmow',
    description: 'Starts the member of the week tournament',
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    type: [CommandType.SLASH],
    run: async (ctx) => {
        try {
            await ctx.deferReply();

            if (await mowTournamentStatus() === true) {
                return ctx.editReply({ content: 'Member of the week tournament has already started' });
            }

            const xpConfigDoc = await xpConfig.findById('config');
            if (xpConfigDoc) {
                xpConfigDoc.mowTournamentStatus = true;
                await xpConfigDoc.save();
            } else {
                await xpConfig.create({ _id: 'config', mowTournamentStatus: true });
            }

            ctx.editReply({ content: 'Member of the week tournament has started' });
        } catch (err) {
            console.error(err);
            return ctx.channel.send({ content: 'An error occurred while trying to start the member of the week tournament' });
        }
    }
});