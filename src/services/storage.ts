import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import { ObjectId } from "mongodb";
import { StorageBucket, getStorageBucket } from "../_enums/StorageBuckets";
import { Readable } from "stream";
import assert from "assert";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  scopes: "https://www.googleapis.com/auth/cloud-platform",
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY,
  },
});

const ONE_HOUR = 1000 * 60 * 60;
const HALF_HOUR = 1000 * 60 * 30;

/**
 * Delete a file stored on the specified storage bucket
 * @param bucketName The name of the bucket to upload the file to
 * @param fileName The name of the file to upload
 * @returns
 */
async function deleteFile(bucketName: string, fileName: string): Promise<void> {
  const bucket = storage.bucket(bucketName);
  await bucket.file(fileName).delete();
}

/**
 * Upload a file into the specified GCP storage bucket
 * @param bucketName The name of the bucket to upload the file to
 * @param fileBuffer The file buffer to upload
 * @param fileName The name of the file to upload
 * @returns
 */
const uploadFile = (
  bucketName: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<void> => {
  return new Promise((resolve) => {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    stream.pipe(file.createWriteStream()).on("finish", () => {
      resolve();
    });
  });
};

/**
 * Get a signed URL for a file in the specified GCP storage bucket
 * @param bucketName The name of the bucket to upload the file to
 * @param fileName The name of the file to upload
 * @param duration The duration in milliseconds for which the URL should be valid
 * @returns The signed URL
 */
const downloadFile = async (
  bucketName: string,
  fileName: string,
  duration: number
): Promise<string> => {
  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "read",
    expires: Date.now() + duration, // 1 hour
  };

  // Get a v4 signed URL for reading the file
  const [url] = await storage
    .bucket(bucketName)
    .file(fileName)
    .getSignedUrl(options);

  return url;
};

/**
 * Check if a file exists in the specified GCP storage bucket
 * @param bucketName The name of the bucket to upload the file to
 * @param fileName The name of the file to upload
 * @returns True if the file exists, false otherwise
 */
const fileExists = async (
  bucketName: string,
  fileName: string
): Promise<boolean> => {
  const [exists] = await storage.bucket(bucketName).file(fileName).exists();
  return exists;
};

/**
 * Upload a profile picture into the GCP storage bucket
 * @param fileBuffer The file buffer of the profile picture to upload
 * @param userId The ID of the user who owns the profile picture
 * @returns the signed URL of the profile picture valid for 1 hour
 */
export async function uploadProfilePicture(
  fileBuffer: Buffer,
  userId: ObjectId
): Promise<string> {
  const fileName = `${userId.toString()}.png`;
  await uploadFile(
    getStorageBucket(StorageBucket.PROFILE_PICTURES),
    fileBuffer,
    fileName
  );
  return getProfilePictureUrl(userId);
}

/**
 * Delete a profile picture stored in the storage bucket
 * @param userId The ID of the user who owns the profile picture
 */
export async function deleteProfilePicture(userId: ObjectId): Promise<void> {
  const fileName = `${userId.toString()}.png`;
  await deleteFile(getStorageBucket(StorageBucket.PROFILE_PICTURES), fileName);
}

/**
 * Returns true if the specified user has a profile picture and false otherwise
 */
export async function hasProfilePicture(userId: ObjectId): Promise<boolean> {
  const fileName = `${userId.toString()}.png`;
  return fileExists(getStorageBucket(StorageBucket.PROFILE_PICTURES), fileName);
}

/**
 * Get a signed URL for a profile picture in the GCP storage bucket
 * @param userId The ID of the user who owns the resume
 * @returns The signed URL for the profile picture valid for 1 hour
 * @throws If there is no stored profile picture for the user
 */
export async function getProfilePictureUrl(userId: ObjectId): Promise<string> {
  const fileName = `${userId.toString()}.png`;
  assert(
    fileExists(getStorageBucket(StorageBucket.PROFILE_PICTURES), fileName),
    "Profile picture does not exist for user: " + userId.toString()
  );
  return await downloadFile(
    getStorageBucket(StorageBucket.PROFILE_PICTURES),
    fileName,
    HALF_HOUR
  );
}

/**
 * Upload a resume into the GCP storage bucket
 * @param fileBuffer The file buffer of the resume to upload
 * @param userId The ID of the user who owns the resume
 * @returns the signed URL of the resume valid for 1 hour
 */
export const uploadResume = async (
  fileBuffer: Buffer,
  userId: ObjectId
): Promise<string> => {
  const fileName = `${userId.toString()}.pdf`;
  await uploadFile(
    getStorageBucket(StorageBucket.RESUME),
    fileBuffer,
    fileName
  );
  return getResumeUrl(userId);
};

/**
 * Get a signed URL for a resume in the GCP storage bucket
 * @param userId The ID of the user who owns the resume
 * @returns The signed URL for the resume valid for 1 hour
 * @throws If there is no stored resume for the user
 */
export const getResumeUrl = async (userId: ObjectId): Promise<string> => {
  const fileName = `${userId.toString()}.pdf`;
  assert(
    fileExists(getStorageBucket(StorageBucket.RESUME), fileName),
    "Resume does not exist for user: " + userId.toString()
  );
  return downloadFile(
    getStorageBucket(StorageBucket.RESUME),
    fileName,
    ONE_HOUR
  );
};

/**
 * Check if a resume exists for the specified user
 * @param userId The ID of the user who owns the resume
 * @returns True if the resume exists, false otherwise
 */
export const hasResume = async (userId: ObjectId): Promise<boolean> => {
  const fileName = `${userId.toString()}.pdf`;
  return fileExists(getStorageBucket(StorageBucket.RESUME), fileName);
};
