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
const path = require('path');
const checkRankPosition = require('./checkRankPosition.js');

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

async function generateRankCard(userId, serverId, roleColor, avatarURL) {
    console.log("Generating rank card");
    const user = await xpUser.findById(`${userId}_${serverId}`);
    const level = user.current_level;
    const xp = user.current_xp;
    const xpToNextLevel = xpLevels[level];
    const avatar = await canvas.loadImage(avatarURL);
    const candyImages = ['purple-candy.png', 'cyan-candy.png', 'yellow-candy.png', 'pink-candy.png', 'blue-candy.png'];
    const randomIndex = Math.floor(Math.random() * candyImages.length);
    const candyImagePath = path.join(__dirname, 'candies', candyImages[randomIndex]);
    const candyImage = await canvas.loadImage(candyImagePath);
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

    // Make circular arc of radius 15px at 10, 10. Then draw the avatar image in the circle
    ctx.beginPath();
    ctx.arc(18, 18, 14, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#222222';
    ctx.fill()

    // Draw avatar image
    ctx.save(); 
    ctx.beginPath();
    ctx.arc(18, 18, 12, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 6, 6, 24, 24);
    ctx.restore();

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

    // Draw rectangle storing candy image and rank #282828
    ctx.font = 'bold 7px georgia';
    const rankPos = `#${await checkRankPosition(userId, serverId)}`;
    const textMetrics = ctx.measureText(rankPos);
    const textWidth = textMetrics.width;

    const padding = 4; // Space between text, image, and border

    const imageWidth = 12;
    const imageHeight = 12;
    const rectWidth = textWidth + imageWidth + padding * 3; // Account for image width and padding
    const rectHeight = 12 + 1.5 * 2; // Adjust based on the image height


    const rectX = (100 - rectWidth) / 2;
    const rectY = 75;
    ctx.fillStyle = '#282828';
    // ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, 5);

    const imageX = rectX + padding;
    const imageY = rectY + (rectHeight - imageHeight) / 2;
    ctx.drawImage(candyImage, imageX, imageY, imageWidth, imageHeight);

    const textX = imageX + imageWidth + (padding-2);
    const textY = rectY + (rectHeight / 2) + 2.5; // Adjust vertical position for centering
    ctx.fillStyle = '#e8e8e8';
    ctx.textAlign = 'start';
    ctx.fillText(rankPos, textX, textY);





    // Save as png in current directory
    console.log("Rank card generated");
    const buffer = await cv.toBuffer();
    return buffer;
}

module.exports = generateRankCard;