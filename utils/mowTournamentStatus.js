// Function that fetches document with id 'config' from the collection. And returns the value of mowTournamentStatus. If document doesnt exist, then it is created with tournament status set to false.

const xpUser = require('../schemas/xpUser');
const xpConfig = require('../schemas/xpConfig');

module.exports = async function mowTournamentStatus() {
    const xpConfigDoc = await xpConfig.findById('config');
    if (!xpConfigDoc) {
        const newConfig = new xpConfig({
            _id: 'config',
            mowTournamentStatus: false
        });

        await newConfig.save();
        return false;
    }

    return xpConfigDoc.mowTournamentStatus;
}