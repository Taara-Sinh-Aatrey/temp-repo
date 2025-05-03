import { s3, bucketName } from '../config/s3';
import { info, error as _error } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} contentType - MIME type of the file
 * @param {string} [folder='images'] - S3 folder path
 * @returns {Promise<string>} The S3 object ID
 */
const uploadFile = async (fileBuffer, contentType, folder = 'images') => {
  try {
    const objectId = `${folder}/${uuidv4()}`;
    
    const params = {
      Bucket: bucketName,
      Key: objectId,
      Body: fileBuffer,
      ContentType: contentType
    };
    
    await s3.upload(params).promise();
    info(`File uploaded successfully to S3: ${objectId}`);
    
    return objectId;
  } catch (error) {
    _error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Get S3 file URL
 * @param {string} objectId - The S3 object ID
 * @returns {string} The S3 URL
 */
const getFileUrl = (objectId) => {
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectId}`;
};

/**
 * Delete a file from S3
 * @param {string} objectId - The S3 object ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
const deleteFile = async (objectId) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: objectId
    };
    
    await s3.deleteObject(params).promise();
    info(`File deleted successfully from S3: ${objectId}`);
    
    return true;
  } catch (error) {
    _error('Error deleting file from S3:', error);
    return false;
  }
};

/**
 * Upload multiple files to S3
 * @param {Array<Buffer>} files - Array of file buffers
 * @param {Array<string>} contentTypes - Array of MIME types
 * @param {string} [folder='images'] - S3 folder path
 * @returns {Promise<Array<string>>} Array of S3 object IDs
 */
const uploadMultipleFiles = async (files, contentTypes, folder = 'images') => {
  try {
    const uploadPromises = files.map((file, index) => {
      return uploadFile(file, contentTypes[index], folder);
    });
    
    const objectIds = await Promise.all(uploadPromises);
    return objectIds;
  } catch (error) {
    _error('Error uploading multiple files to S3:', error);
    throw new Error('Failed to upload multiple files to S3');
  }
};

export default {
  uploadFile,
  getFileUrl,
  deleteFile,
  uploadMultipleFiles
};