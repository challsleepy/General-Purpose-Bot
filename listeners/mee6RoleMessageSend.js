const { Listener } = require('gcommands');

const rolesHandler = async (msgContent, player) => {
    if (msgContent.includes('level 10')) return await player.roles.add('1263454030869565523');
    if (msgContent.includes('level 15')) return await player.roles.add('1263454151707459625');
    if (msgContent.includes('level 20')) return await player.roles.add('1263454212361027685');
    if (msgContent.includes('level 25')) return await player.roles.add('1263454552678596618');
    if (msgContent.includes('level 30')) return await player.roles.add('1263454639509209148');
    if (msgContent.includes('level 35')) return await player.roles.add('1263455072751190107');
    if (msgContent.includes('level 40')) return await player.roles.add('1263455210291068938');
    if (msgContent.includes('level 45')) return await player.roles.add('1263455337445593148');
    if (msgContent.includes('level 50')) return await player.roles.add('1263455834189594696');
}

// Create a new listener listening to the "ready" event
new Listener({
    // Set the name for the listener
    name: 'Message Send',
    // Set the event to listen to
    event: 'messageCreate',
    // The function thats called when the event occurs
    run: async (ctx) => {
        console.log(ctx.content);
        if (ctx.channelId === '1263459766978613319' && ctx.author.id === '660409806208630806' && ctx.content.includes('Congratulations')) {
            let player;
            const userId = ctx.content.match(/<@!?(\d+)>/)[1];
            console.log(userId)

            if (ctx.guild.members.cache.has(userId)) {
                console.log('Was in cache')
                player = ctx.guild.members.cache.get(userId);
                await rolesHandler(ctx.content, player);
            } else {
                console.log('Had to fetch, wasnt in cache')
                ctx.guild.members.fetch(userId)
                    .then(async playerObj => {
                        player = playerObj
                        console.log(player)
                        await rolesHandler(ctx.content, player);
                    })
                    .catch(console.error);
            }

        }
    }
});