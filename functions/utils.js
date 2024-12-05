const zlib = require('zlib');

/**
 * Encrypts customer IDs by compressing and encoding them in Base64 format.
 * @param {Array} customerIds - Array of customer IDs to encrypt.
 * @returns {string} - Base64 encoded compressed string.
 */
function encryptedCustomerIds(customerIds) {
    if (!Array.isArray(customerIds)) {
        throw new Error('Input must be an array of customer IDs');
    }

    // Convert customer IDs array to JSON string
    const jsonString = JSON.stringify(customerIds);

    // Compress JSON string using gzipSync
    const compressedBuffer = zlib.gzipSync(jsonString);

    // Encode compressed buffer to Base64
    return compressedBuffer.toString('base64');
}

/**
 * Decrypts a Base64 encoded string by decoding and decompressing it.
 * @param {string} encryptedIds - Base64 encoded string to decrypt.
 * @returns {Promise<Array>} - Decrypted array of customer IDs.
 */
async function decryptedCustomerIds(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Input must be a Base64-encoded string');
    }

    // Decode Base64 string to buffer
    const decodedBuffer = Buffer.from(encryptedData, 'base64');

    // Decompress the buffer using zlib.gunzip
    const decompressedBuffer = await new Promise((resolve, reject) => {
        zlib.gunzip(decodedBuffer, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });

    // Parse decompressed buffer to JSON and return the array
    return JSON.parse(decompressedBuffer.toString('utf-8'));
}

module.exports = {
    encryptedCustomerIds,
    decryptedCustomerIds,
};
