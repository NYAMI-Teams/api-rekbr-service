import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../utils/s3Client.js";
import { sanitizeFileName } from "../utils/utils.js";

const uploadToSpaces = async (fileBuffer, fileName, mimeType) => {
  const name = sanitizeFileName(fileName) + `-${Date.now()}`;
  // const name = sanitizeFileName(fileName);

  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: name,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: "public-read",
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${name}`;
};

const deleteFromSpaces = async (fileKey) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.SPACES_BUCKET,
    Key: fileKey, // contoh: 'uploads/profile-123.png'
  });

  await s3.send(command);
};

export default {
  uploadToSpaces,
  deleteFromSpaces,
};
