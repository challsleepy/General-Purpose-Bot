require('dotenv').config();
const { GClient, Plugins, Command, Component } = require('gcommands');
const { GatewayIntentBits } = require('discord.js');
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
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

// Login to the discord API
mongoose.connect(`mongodb://${config.mongoDB.username}:${config.mongoDB.password}@${config.mongoDB.host}:${config.mongoDB.port}/${config.mongoDB.database}?authSource=${config.mongoDB.authSource}`)
	.then(async () => {
		console.log("Connected to MongoDB database.");
		client.login(config.discord.token);

		// Get all users with level 10 or above
		const users = await xpUser.find({ current_level: { $gte: 10 } });
		const userBackgroundsMap = new Map();

		for (const user of users) {
			// Calculate the number of batches based on the user's level
			const numBatches = Math.floor((user.current_level - 10) / 5) + 1;
			let backgroundsToGive = [];

			for (let i = 0; i < numBatches; i++) {
				// Randomly select 4-7 backgrounds
				const numBackgrounds = Math.floor(Math.random() * 4) + 4; // 4 to 7
				const shuffledBackgrounds = rankCardBackgrounds.backgrounds.sort(() => Math.random() - 0.5);
				const batchBackgrounds = shuffledBackgrounds.slice(0, numBackgrounds);
				backgroundsToGive = backgroundsToGive.concat(batchBackgrounds);
			}

			// Remove duplicates in case the same background was selected multiple times
			backgroundsToGive = [...new Set(backgroundsToGive)];

			// Update user's unlocked backgrounds
			user.rankCard.unlockedBackgrounds = user.rankCard.unlockedBackgrounds
				? [...new Set(user.rankCard.unlockedBackgrounds.concat(backgroundsToGive))]
				: backgroundsToGive;

			await user.save();

			// Store the number of new backgrounds given to this user
			userBackgroundsMap.set(user._id, backgroundsToGive.length);
		}

		console.log('Assigned backgrounds to users based on their level.');

		// Send a message to each user about the new backgrounds they have received
		for (const user of users) {
			const discordUser = await client.users.fetch(user._id.split('_')[0]);
			const backgroundsReceived = userBackgroundsMap.get(user._id);
			console.log(`User ${discordUser.tag} has received ${backgroundsReceived} new backgrounds`);
			const message = `Hey! You have received **${backgroundsReceived}** new backgrounds for your rank card! Customize your rank card using these backgrounds with the \`/edit-rank-card\` command in <#1273300591875194880>.`;
			await discordUser.send(message).catch(() => console.log(`Could not send message to ${discordUser.tag}`));
		}


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
