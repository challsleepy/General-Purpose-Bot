const petPetGif = require('pet-pet-gif');
const { Command, CommandType, Argument, ArgumentType, MessageEmbed } = require('gcommands');

// Command /pet that generataes a pet pet gif for the current user or another user (if argument provided) and sends

new Command({
    name: 'pet',
    description: 'Pet pet pet',
    type: [CommandType.SLASH],
    arguments: [
        new Argument({
            name: 'user',
            description: 'User to pet',
            type: ArgumentType.USER,
            required: false
        })
    ],
    run: async (ctx) => {
        try {
            await ctx.deferReply();

            // Extract the user from the arguments
            const userArg = ctx.arguments.getUser('user');
            // Set the user to the author if no user is provided in argument
            const user = userArg ? await ctx.guild.members.fetch(userArg.id) : ctx.member;

            const gif = await petPetGif(user.user.displayAvatarURL({ extension: 'png' }));

            const embed = new MessageEmbed()
                .setTitle('Pet pet pet')
                .setDescription(`*AGGRESSIVE PETTING*`)
                .setColor('#FFBF00')
                .setImage('attachment://pet.gif')
                .setTimestamp();

            await ctx.editReply({ embeds: [embed], files: [{ attachment: gif, name: 'pet.gif' }] });

        } catch (err) {
            console.error(err);
        }
    }
})