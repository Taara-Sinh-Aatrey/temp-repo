import { config, S3 } from 'aws-sdk';
import logger from '../utils/logger';

// Configure AWS SDK
config.update({
  region: process.env.AWS_REGION
});

// Create S3 instance
const s3 = new S3({
  region: process.env.AWS_REGION
});

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

export default {
  s3,
  bucketName,
  initializeS3
};