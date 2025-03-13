const AWS = require('aws-sdk');
const logger = require('../utils/logger');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 instance
const s3 = new AWS.S3();

// S3 bucket name
const bucketName = process.env.S3_BUCKET_NAME;

// Initialize S3 by checking if bucket exists
const initializeS3 = async () => {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    logger.info(`S3 bucket '${bucketName}' is accessible`);
    return true;
  } catch (error) {
    logger.error(`Error accessing S3 bucket '${bucketName}':`, error);
    return false;
  }
};

module.exports = {
  s3,
  bucketName,
  initializeS3
};