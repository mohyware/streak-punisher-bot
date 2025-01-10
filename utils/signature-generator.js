const crypto = require('crypto');

const generateApiSignature = (methodName, params, apiSecret) => {
    const rand = Math.random().toString(36).substring(2, 8); // Generate random 6 characters
    const time = Math.floor(Date.now() / 1000); // Current UNIX timestamp

    // Construct the query string with parameters sorted lexicographically
    const queryParams = Object.entries(params)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Sort by parameter name
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    // Construct the signature base string
    const signatureBase = `${rand}/${methodName}?${queryParams}#${apiSecret}`;

    // Generate the SHA-512 hash and prepend the rand
    const apiSig = rand + crypto.createHash('sha512').update(signatureBase).digest('hex');

    return { rand, time, apiSig };
};

module.exports = {
    generateApiSignature
}