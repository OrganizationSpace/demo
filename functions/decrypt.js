const zlib = require('zlib');


const decryptData = async (encodedString) => {
    try {
        // Decode the base64 string to a Buffer
        const decodedBuffer = Buffer.from(encodedString, 'base64');
        console.log("Encoded Buffer:", decodedBuffer);

        // Decompress the buffer using zlib's gunzip method
        const decompressedBuffer = await new Promise((resolve, reject) => {
            zlib.gunzip(decodedBuffer, (err, result) => {//is an asynchronous method that decompresses a Buffer object that was previously compressed using GZIP compression.
                if (err) {
                    reject(err);// Reject if decompression fails
                } else {
                    resolve(result);// Resolve with the decompressed data
                }
            });
        });

        // Parse and return the decompressed data as a JSON object
        const decryptedData = JSON.parse(decompressedBuffer.toString('utf-8'));
        console.log("Decrypted Data:", decryptedData);
        return decryptedData;
    } catch (error) {
        console.error("Decryption failed:", error.message);
        throw new Error("Invalid encrypted data format");
    }
};

module.exports = decryptData;
