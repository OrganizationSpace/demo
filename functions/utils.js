const zlib = require('zlib');

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



 const decryptedCustomerIds= async(req,res) =>{
   try{const encryptedData=req.body.encodedString
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
    const decodedString=decompressedBuffer.toString('utf-8');
    req.decryptedData=JSON.parse(decodedString)}

catch(error){
    res.status(500).JSON({message:'Error'});
}}

module.exports = {
    encryptedCustomerIds,
    decryptedCustomerIds,
};
