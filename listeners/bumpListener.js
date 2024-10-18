const { Listener } = require('gcommands');
const bumpersSchema = require('../schemas/bumpersSchema');
const bumpConfigSchema = require('../schemas/bumpConfig');
const { EmbedBuilder } = require('discord.js');

new Listener({
    name: 'Bump Listener',
    event: 'messageCreate',
    run: async ctx => {
        if (ctx.author.id === "302050872383242240") {
            // check if embed description has "Bump done"
            if (ctx.embeds[0]?.description?.includes("Bump done!")) {
                try {
                    // Fetch the user who bumped the server
                    const bumper = ctx.interaction.user
                    console.log(bumper)

                    // Fetch the bumper document
                    let bumperDoc = await bumpersSchema.findById(bumper.id);

                    console.log(bumperDoc)

                    // Create bumper document if it doesn't exist
                    if (!bumperDoc) {
                        console.log("Creating new bumper document")
                        bumperDoc = new bumpersSchema({
                            _id: bumper.id,
                            numberOfBumps: 0,
                            streak: 0,
                            lastBumped: null
                        });
                        await bumperDoc.save();
                    }

                    // Create bump config if it doesn't exist
                    let bumpConfig = await bumpConfigSchema.findById("config");
                    if (!bumpConfig) {
                        bumpConfig = new bumpConfigSchema({
                            _id: "config",
                            lastBumper: bumper.id
                        });
                        await bumpConfig.save();
                    }

                    // Create a message to send to the user
                    let description = '';

                    // Add 1 to the number of bumps
                    bumperDoc.numberOfBumps += 1;

                    // Append string to the description
                    description += `This was your \`${bumperDoc.numberOfBumps}`;
                    if (bumperDoc.numberOfBumps % 10 === 1 && bumperDoc.numberOfBumps % 100 !== 11) {
                        description += "st\`";
                    } else if (bumperDoc.numberOfBumps % 10 === 2 && bumperDoc.numberOfBumps % 100 !== 12) {
                        description += "nd\`";
                    } else if (bumperDoc.numberOfBumps % 10 === 3 && bumperDoc.numberOfBumps % 100 !== 13) {
                        description += "rd\`";
                    } else {
                        description += "th\`";
                    }
                    description += " bump.";

                    // Check if the users last bumper was the same as the current bumper (to increase/reset streak)
                    if (bumpConfig.lastBumper === bumper.id) {
                        bumperDoc.streak += 1;
                        description += ` \nYou are on a streak of \`${bumperDoc.streak}\` bumps!`;
                    } else {
                        // If current bumper had a streak, then notify the user about their streak being reset
                        if (bumperDoc.streak > 1) {
                            description += ` \nRIP, you lost your streak of \`${bumperDoc.streak}\` bumps.`;
                        }
                        bumperDoc.streak = 1;
                    }

                    // Update the lastBumped date
                    bumperDoc.lastBumped = new Date();
                    await bumperDoc.save();

                    // Update the last bumper in the config
                    bumpConfig.lastBumper = bumper.id;
                    await bumpConfig.save();

                    const embed = new EmbedBuilder()
                        .setTitle("We vibin")
                        .setColor("FFBF00")
                        .setDescription(description)
                        .setImage('https://media.tenor.com/x5jwK4cZEnsAAAAM/pepe-hype-hands-up.gif')
                        .setFooter({ text: "Thanks for bumping the server!" });

                    // Send the description to the user
                    ctx.channel.send({ embeds: [embed] });

                } catch (err) {
                    console.log("Error fetching reference", err)
                }
            }
        }
    }
})