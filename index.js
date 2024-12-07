require('dotenv').config();
const { GClient, Plugins, Command, Component } = require('gcommands');
const { GatewayIntentBits, Partials } = require('discord.js');
const { join } = require('path');
const config = require('./config.json')
const mongoose = require('mongoose');
const { CronJob } = require('cron');
const xpUser = require('./schemas/xpUser');
const rankCardBackgrounds = require('./rankCardBackgrounds.json');

// Set the default cooldown for commands
// Command.setDefaults({
// 	cooldown: '20s',
// });

// Set the default onError function for components
Component.setDefaults({
	onError: (ctx, error) => {
		return ctx.reply('Oops! Something went wrong')
	}
});


// Search for plugins in node_modules (folder names starting with gcommands-plugin-) or plugins folder
Plugins.search(__dirname);

const client = new GClient({
	// Register the directories where your commands/components/listeners will be located.
	dirs: [
		join(__dirname, 'commands'),
		join(__dirname, 'components'),
		join(__dirname, 'listeners')
	],
	// Enable message support
	messageSupport: true,
	// Set the prefix for message commands
	messagePrefix: '!',
	// Set the guild where you will be developing your bot. This is usefull cause guild slash commands update instantly.
	devGuildId: config.discord.devGuildId,
	// Set the intents you will be using (https://discordjs.guide/popular-topics/intents.html#gateway-intents)
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,      
        GatewayIntentBits.GuildMessageReactions,
      ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User, Partials.Reaction]
});

// Login to the discord API
mongoose.connect(`mongodb://${config.mongoDB.username}:${config.mongoDB.password}@${config.mongoDB.host}:${config.mongoDB.port}/${config.mongoDB.database}?authSource=${config.mongoDB.authSource}`)
	.then(async () => {
		console.log("Connected to MongoDB database.");
		client.login(config.discord.token);

		// Reset votesLeft for all users every day at midnight
		const job = new CronJob(
			'0 0 * * *', // cronTime
			async function () {
				// Reset votesLeft for all users (set to voteCount value in config). Need to check if they have that field first
				try {
					await xpUser.updateMany({ votesLeft: { $exists: true } }, { $set: { votesLeft: config.discord.voteCount, votedMembers: [] } });
					console.log('Reset votesLeft for all users. Emptied votedMembers array');
				} catch (err) {
					console.error(err);
				}
			}, // onTick
			null, // onComplete
			true, // start
			'Africa/Lagos' // timeZone
		);
	});
