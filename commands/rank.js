// ? Have to add feature to let people see others' rank
// Add additional argument to check other people's rank
const { Command, CommandType, Argument, ArgumentType } = require('gcommands');
const xpUser = require('../schemas/xpUser');
const checkRankPosition = require('../utils/checkRankPosition');
const { logInfo, logSuccess } = require('../utils/consoleLoggers');

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
        await ctx.deferReply();
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
                return ctx.editReply({ content: 'You have not sent any messages yet!', ephemeral: true });
            } else {
                return ctx.editReply({ content: 'This user has not sent any messages yet!', ephemeral: true });
            }
        }

        // Get the user's rank card details
        logInfo(`Generating rank card for ${user.id}`);
        logInfo(`Getting rank card details for user ${user.id}`);
        const avatarURL = user.displayAvatarURL({ extension: 'png' });
        const xp = userRankDetails.current_xp;
        const level = userRankDetails.current_level;
        const progressBarColor = userRankDetails.rankCard.progressBarColor || userRankDetails.displayHex;
        const background = userRankDetails.rankCard.background || '#222222';
        const rank = await checkRankPosition(user.id, ctx.guild.id);

        // Create url with params to get rank card gif
        logInfo(`Creating url with params to get rank card gif for user ${user.id}`);
        const url = new URL('http://127.0.0.1:4500/rankcard/rankCardGif');
        url.searchParams.append('avatarURL', avatarURL);
        url.searchParams.append('xp', xp);
        url.searchParams.append('level', level);
        url.searchParams.append('progressBarColor', progressBarColor);
        url.searchParams.append('background', background);
        url.searchParams.append('rank', rank);

        // Fetch the rank card base64
        logInfo(`Fetching rank card base64 for user ${user.id}`);
        const rankCardBase64 = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const base64 = await rankCardBase64.text();

        // Gif base64 to gifbuffer
        logInfo(`Converting base64 to buffer for user ${user.id}`);
        const rankBuffer = Buffer.from(base64, 'base64');

        logSuccess(`Rank card generated for ${user.id}`);
        // Send the rank card to the user
        await ctx.editReply({
            files: [{
                attachment: rankBuffer,
                name: 'rank.gif'
            }]
        });
    }
});