const { Listener } = require("gcommands");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

// Listener to check if user joined the server and send a welcome message with png attachment
new Listener({
	name: "Server Welcome",
	event: "guildMemberAdd",
	run: async (ctx) => {
		if (ctx.user.bot) return;

		try {
			const welcomeChannel = await ctx.guild.channels.fetch(config.discord.welcomeChannelId)

			const embed = new EmbedBuilder()
				.setTitle(`Welcome to ${ctx.guild.name}!`)
				.setDescription(`Hey <@${ctx.user.id}>!`)
				.setImage("attachment://banner.png")
				.setColor("#ffbf00")
				.setTimestamp();

			await welcomeChannel.send({
				embeds: [embed],
				files: [
					{
						attachment:
							"./utils/assets/codenchillbanner.png",
						name: "banner.png",
					},
				],
			});
		} catch (error) {
			console.log(error);
		}
	},
});
