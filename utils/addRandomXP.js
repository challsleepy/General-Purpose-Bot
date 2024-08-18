// ? Function that accepts user mongoose object and adds random xp to it in range 15-30, then saves it to the database
const { addCooldown, isOnCooldown } = require('./cooldown.js');

/**
 * @typedef {Object} User
 * @property {string} _id - The user/guild id combo
 * @property {number} current_xp - The current experience points of the user
 * @property {number} current_level - The current level of the user
 * @property {function(): Promise<void>} save - The function to save the user object to the database
 */

/**
 * Add random xp in range 15-30 to user
 * @param {User} user - The user mongoose object
 */

const xpLevels = [100, 155, 220, 295, 380, 475, 580, 695, 820, 955, 1100, 1260, 1420, 1600, 1780, 1980, 2180, 2400, 2620, 2860, 3100, 3360, 3620, 3900, 4180, 4480, 4780, 5100, 5420, 5760, 6100, 6460, 6820, 7200, 7580, 7980, 8380, 8800, 9220, 9660, 10100, 10560, 11020, 11500, 11980, 12480, 12980, 13500, 14020, 14560, 15100, 15660, 16220, 16800, 17380, 17980, 18580, 19200, 19820, 20460, 21100, 21760, 22420, 23100, 23780, 24480, 25180, 25900, 26620, 27360, 28100, 28860, 29620, 30400, 31180, 31980, 32780, 33600, 34420, 35260, 36100, 36960, 37820, 38700, 39580, 40480, 41380, 42300, 43220, 44160, 45100, 46060, 47020, 48000, 48980, 49980, 50980, 52000, 53020, 54060];

async function addRandomXP(user, ctx) {
    // Check if user is in cooldown
    if (isOnCooldown(ctx.author.id)) return;

    // Add random xp in range 15-30 to user
    user.current_xp += Math.floor(Math.random() * 16) + 15;
    // Add the user to the cooldown (1 minute)
    addCooldown(ctx.author.id, 60000);

    // If the user has enough xp to level up
    if (user.current_xp >= xpLevels[user.current_level]) {
        // Add 1 to the user's current_level
        user.current_level += 1;
        // Reset the user's current_xp
        user.current_xp = user.current_xp - xpLevels[user.current_level - 1];
        // Send a message to the user
        ctx.author.send(`Congratulations! You have leveled up to level ${user.current_level}!`);
    }
 
    // Save the user to the database
    await user.save();
}

module.exports = {
    addRandomXP,
};