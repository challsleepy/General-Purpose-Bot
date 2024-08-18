// Empty cooldown array. Add and remove functions to it to manage cooldowns
const cooldowns = [];

/**
 * Check if a user is on cooldown
 * @param {string} id - The id to check
 * @returns {boolean}
 */
function isOnCooldown(id) {
    return cooldowns.includes(id);
}

/**
 * Add a user to the cooldown array
 * @param {string} id - The id to add
 * @param {string} time - The time to add
 */
function addCooldown(id, time) {
    cooldowns.push(id);
    setTimeout(() => {
        removeCooldown(id);
    }, time);
}

/**
 * Remove a user from the cooldown array
 * @param {string} id - The id to remove
 */
function removeCooldown(id) {
    const index = cooldowns.indexOf(id);
    if (index > -1) {
        cooldowns.splice(index, 1);
    }
}

module.exports = {
    isOnCooldown,
    addCooldown,
    removeCooldown
};