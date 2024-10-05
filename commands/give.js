const { PermissionFlagsBits } = require('discord.js');
const { Command, Argument, ArgumentType } = require('gcommands');
const { CommandType } = require('gcommands/dist/index');
const xpUser = require('../schemas/xpUser');
const rankCardBackgrounds = require('../rankCardBackgrounds.json');
const mowTournamentStatus = require('../utils/mowTournamentStatus');

new Command({
    name: 'give',
    description: 'Give stuff to a user',
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    type: [CommandType.SLASH],
    arguments: [
        new Argument({
            name: 'user',
            description: 'The user you wanna give stuff to',
            type: ArgumentType.USER,
            required: true
        }),
        new Argument({
            name: 'type',
            description: 'What do ya wanna give this user?',
            choices: [
                { name: 'MOW Points', value: 'mowPoints' },
                { name: 'Rank Card Backgrounds (GIFS)', value: 'rankBackgroundGifs' }
            ],
            type: ArgumentType.STRING,
            required: true
        }),
        new Argument({
            name: 'amount',
            description: 'How much of the stuff do ya wanna give',
            type: ArgumentType.NUMBER,
            required: true
        })
    ],
    run: async (ctx) => {
        if (ctx.user.bot) return;
        await ctx.deferReply();

        // Command arguments
        const type = ctx.arguments.getString('type');
        const amount = ctx.arguments.getNumber('amount');

        // User to give the stuff to
        const user = ctx.arguments.getUser('user');
        const userDoc = await xpUser.findById(`${user.id}_${ctx.guild.id}`);

        // Check if the user exists
        if (!userDoc) {
            return ctx.editReply({ content: 'This member hasn\'t sent a message on the server!', ephemeral: true });
        }

        // Check if the type is MOW Points
        if (type === 'mowPoints') {
            // Check if mowTournamentStatus is false
            if (await mowTournamentStatus() === false) {
                return ctx.editReply('This command is only available during member of the week competitions!');
            }

            userDoc.mowPoints = userDoc.mowPoints ? userDoc.mowPoints + amount : amount;
            await userDoc.save();

            await ctx.editReply({ content: `Successfully gave **${amount}** MOW Points to <@${user.id}>` });
        }

        // Check if the type is Rank Card Backgrounds (GIFS)
        if (type === 'rankBackgroundGifs') {
            // Ensure that user.rankCard exists
            if (!userDoc.rankCard) {
                userDoc.rankCard = {};
            }

            // Initialize unlockedBackgrounds if it doesn't exist
            const userBackgrounds = userDoc.rankCard.unlockedBackgrounds || [];

            // Assuming rankCardBackgrounds is an array of background IDs
            const allBackgrounds = rankCardBackgrounds.backgrounds; // or rankCardBackgrounds.backgrounds if it's an object

            // Filter out backgrounds the user already has
            const availableBackgrounds = allBackgrounds.filter(bg => !userBackgrounds.includes(bg));

            // Amount of backgrounds to give (specified by command executor)
            const numBackgroundsToGive = amount; // Ensures we don't request more than available

            // Check if the this amount is more than the available backgrounds
            if (numBackgroundsToGive > availableBackgrounds.length) {
                return ctx.editReply({ content: `You can only give a maximum of **${availableBackgrounds.length}** rankcard backgrounds to this user` });
            }

            const backgroundsToGive = [];

            // Randomly select backgrounds to give
            for (let i = 0; i < numBackgroundsToGive; i++) {
                const randomIndex = Math.floor(Math.random() * availableBackgrounds.length);
                const randomBackground = availableBackgrounds.splice(randomIndex, 1)[0]; // Remove to prevent duplicates
                backgroundsToGive.push(randomBackground);
                userBackgrounds.push(randomBackground);
            }

            // Update the user's unlockedBackgrounds
            userDoc.rankCard.unlockedBackgrounds = userBackgrounds;

            // Save the user data
            await userDoc.save();

            await ctx.editReply({ content: `Successfully gave **${numBackgroundsToGive}** rank card backgrounds to <@${user.id}>` });

            // Send a message to the user with the backgrounds they received
            await user.send(`You have received **${backgroundsToGive.length}** new backgrounds for your rank card! You can customize your rankcard using \`/edit-rank-card\``)
            .then().catch(() => {
                ctx.editReply({ content: `Failed to send a DM to <@${user.id}> informing them about the backgrounds that they received` });
            })
        }

    }
})