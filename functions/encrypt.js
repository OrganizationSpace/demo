const zlib = require('zlib');

// Encrypt function that will be called by the route
const encryptData = async (customerIds) => {
    try {
        // Convert the customer IDs array to a JSON string
        const jsonString = JSON.stringify({ ids: customerIds });

        // Compress the JSON string using gzip
        const compressedBuffer = zlib.gzipSync(jsonString);

        // Encode the compressed data into a base64 string
        const base64Encoded = compressedBuffer.toString('base64');

        // Return the base64-encoded encrypted data
        return base64Encoded;
    } catch (error) {
        console.error("Encryption error:", error.message);
        throw new Error('Encryption failed');
    }
};

module.exports = encryptData;
