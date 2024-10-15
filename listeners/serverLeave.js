const { Listener } = require("gcommands");
const config = require("../config.json");

// Listener to check if user left the server and send a message to the leave channel
new Listener({
	name: "Member Leave",
	event: "guildMemberRemove",
	run: async (ctx) => {
		if (ctx.user.bot) return;

		try {
			// Fetch the leave channel (where the bot will send the leave message)
			const leaveChannel = await ctx.guild.channels.fetch(config.discord.leaveChannelId)

			// Array of responses to send when a user leaves the server
            const leaveResponses = [
				`**${ctx.user.displayName}** just left the server. Didn't need em anyway <:aight:1275472558527086744>`, 
				`<:agony:1281008021136478218> NOOOOO SOMEONE JUST LEFT...oh it was just **${ctx.user.displayName}**`, 
				`<a:stitch_sad:1292959059951095940> **${ctx.user.displayName}** will be missed`
			]
			
			// Send random response from leaveResponses array
			await leaveChannel.send({ content: leaveResponses[Math.floor(Math.random() * leaveResponses.length)] });
		} catch (error) {
			console.log(error);
		}
	},
});
