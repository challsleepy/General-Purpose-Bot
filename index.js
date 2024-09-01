require('dotenv').config();
const { GClient, Plugins, Command, Component } = require('gcommands');
const { GatewayIntentBits } = require('discord.js');
const { join } = require('path');
const config = require('./config.json')
const mongoose = require('mongoose');
const XPUser = require('./schemas/xpUser');

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
	.then(() => {
		console.log("Connected to MongoDB database.");
		client.login(config.discord.token);
	});
