const zlib = require('zlib');
const crypto = require('crypto');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key is missing in environment variables.');
}

// Encrypt and compress IDs
const encryptIDs = (ids) => {
    const jsonString = JSON.stringify(ids);
    const compressed = zlib.gzipSync(jsonString);
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
    return encrypted.toString('base64');
};

// Decrypt and decompress IDs
const decryptIDs = (encryptedData) => {
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    console.log("encryptedBuffer",encryptedBuffer);
    
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    const decompressed = zlib.gunzipSync(decrypted);
     req.dedata=  JSON.parse(decompressed.toString());
     const de =req.dedata
     console.log("de",de);
     
     return de
};

module.exports = { encryptIDs, decryptIDs };
