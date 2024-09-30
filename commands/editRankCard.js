// Command that allows users to edit their rank card. Creates a session and saves it to db. This session id is then used by frontend to edit the rank card.

const { Command, CommandType, MessageEmbed } = require('gcommands')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const xpUser = require('../schemas/xpUser')
const editRankCardSession = require('../schemas/editorSessionSchema')
const { randomBytes } = require('crypto');
const { logInfo, logSuccess } = require('../utils/consoleLoggers');
const checkRankPosition = require('../utils/checkRankPosition');

new Command({
    name: 'edit-rank-card',
    description: 'Edit your rank card',
    type: [CommandType.SLASH],
    run: async (ctx) => {
        return ctx.reply({ content: 'This command is currently disabled', ephemeral: true })
        const user = await xpUser.findById(`${ctx.user.id}_${ctx.guild.id}`)
        if (!user) {
            return ctx.editReply({ content: 'You have not sent any messages yet!', ephemeral: true })
        }

        const sessionID = randomBytes(16).toString('hex')

        // Create a session in the database (deleted after 10 seconds)
        logInfo(`Creating a rank editor session with id ${sessionID} for user ${ctx.user.id}`)

        const session = await editRankCardSession.create({
            _id: sessionID,
            user_id: ctx.user.id,
            rankCardData: {
                avatarURL: ctx.user.displayAvatarURL({ extension: 'png' }),
                xp: user.current_xp,
                level: user.current_level,
                progressBarColor: user.rankCard.progressBarColor || user.displayHex,
                background: user.rankCard.background || '#222222',
                rank: await checkRankPosition(ctx.user.id, ctx.guild.id)
            }
        })

        logSuccess(`Created a rank editor session with id ${sessionID} for user ${ctx.user.id}`)

        const buttonRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel('Edit Rank Card')
                .setURL(`http://localhost:3000/rankCard/${session._id}`)
                .setStyle(ButtonStyle.Link)
        ])

        const embed = new MessageEmbed()
            .setDescription('Click the button below to edit your rank card')
            .setFooter({ text: 'This link will expire in 10 minutes' })
            .setColor('#FFBF00')

        ctx.editReply({ embeds: [embed], components: [buttonRow] })
    }
});