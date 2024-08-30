// Create function to check for rank position. Takes in userID and guildID and returns the rank position of the user in the guild. Fetches all records from mongoose and sorts them (1st priority given to level, 2nd priority given to xp). Returns the rank position of the user.
/**
 * Check the rank position of a user
 * @param {string} userId - The id of the user
 * @param {string} serverId - The id of the server
 * @returns {number}
 */

const xpUser = require('../schemas/xpUser');

async function checkRankPosition(userId, serverId) {
    const users = await xpUser.find({}).sort({ current_level: -1, current_xp: -1 });
    const user = users.find(user => user._id === `${userId}_${serverId}`);
    console.log(users);
    console.log(user);
    console.log(users.indexOf(user) + 1);
    return users.indexOf(user) + 1;
}

module.exports = checkRankPosition;