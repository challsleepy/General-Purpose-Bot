function logInfo(message) {
    console.log('\x1b[34m[INFO]\x1b[0m', message);
}

function logSuccess(message) {
    console.log('\x1b[32m[SUCCESS]\x1b[0m', message);
}

function logError(message) {
    console.log('\x1b[31m[ERROR]\x1b[0m', message);
}

module.exports = { logInfo, logSuccess, logError }