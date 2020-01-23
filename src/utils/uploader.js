const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY
});


exports.uploadFile = async (fileOpt) => {
    try {
        // Read content from the file
        const fileContent = fs.readFileSync(fileOpt.path);

        // Setting up S3 upload parameters
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileOpt.name, // File name you want to save as in S3
            Body: fileContent,
            StorageClass: 'S3 Glacier Storage',
            ContentType: fileOpt.mimeType,
            ContentLength: fileOpt.sizeInBytes
        };

        // Uploading files to the bucket
        let data = await new Promise(resolve, reject => {

            s3.upload(params, function (err, data) {
                if (err) {
                    reject()
                    throw err;
                };
                console.log(`File uploaded successfully. ${data.Location}`);
                resolve(data);
            });
        });

        return data;
    } catch (error) {
        throw error;
    }
};
