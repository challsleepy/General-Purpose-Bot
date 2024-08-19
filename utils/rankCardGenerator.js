// Function takes in userId, serverId, and avatarURL. Fetches user current level and xp from database. Generates a rank card with the user's level, xp, and xp required to reach next level (by a progress ring around their avatar, fetched with discord api). Returns the rank card as a buffer.
/**
 * Generate a rank card for a user
 * @param {string} userId - The id of the user
 * @param {string} serverId - The id of the server
 * @param {string} roleColor - The color of the user's role
 * @returns {Buffer}
 */

const canvas = require('canvas');
const xpUser = require('../schemas/xpUser.js');
const { xpLevels } = require('./addRandomXP.js');
const fs = require('fs');

async function generateRankCard(userId, serverId, roleColor) {
    console.log("Generating rank card");
    const user = await xpUser.findById(`${userId}_${serverId}`);
    const level = user.current_level;
    const xp = user.current_xp;
    const xpToNextLevel = xpLevels[level];
    const width = 200;
    const height = 200;
    const cv = canvas.createCanvas(width, height);
    const ctx = cv.getContext('2d');
    ctx.scale(2, 2)
    // ctx.translate(0.5, 0.5);

    // Draw background
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, width, height);

    // Progress bar track
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.arc(50, 50, 30, Math.PI * 0.8, Math.PI * 2.2, false);
    ctx.strokeStyle = '#333333';
    ctx.stroke();
    ctx.closePath();

    // Progress bar
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.arc(50, 50, 30, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * (xp / xpToNextLevel)), false);
    ctx.strokeStyle = roleColor;
    ctx.stroke();
    ctx.closePath();

    // Level text
    ctx.font = 'bold 15px sans-serif';
    ctx
    ctx.fillStyle = '#eeeeee';
    ctx.textAlign = 'center';
    ctx.fillText(`${level}`, 50, 47);

    // XP text
    ctx.font = '6px sans-serif';
    ctx.fillStyle = '#eeeeee';
    ctx.textAlign = 'center';
    let xpText = `${xp} / ${xpToNextLevel}`;
    if (xpToNextLevel >= 1000) {
        xpText = `${xp} / ${(xpToNextLevel / 1000).toFixed(1)}k`;
    }
    if (xp >= 1000) {
        xpText = `${(xp / 1000).toFixed(1)}k / ${(xpToNextLevel / 1000).toFixed(1)}k`;
    }
    ctx.fillText(xpText, 50, 57);

    // Save as png in current directory
    console.log("Rank card generated");
    const buffer = await cv.toBuffer();
    return buffer;
}

module.exports = generateRankCard;