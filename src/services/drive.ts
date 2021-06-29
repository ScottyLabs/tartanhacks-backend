/**
 * Service for uploading files to Google Drive
 */
import { Credentials, OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import readline from "readline";
import fs from "fs";
import { Readable } from "stream";
import { IUser } from "../_types/User";
import { IProfile } from "../_types/Profile";

const SCOPE = "https://www.googleapis.com/auth/drive.file";
const TOKEN_PATH = "token.json";
const redirectUri = "urn:ietf:wg:oauth:2.0:oob";

/**
 * Upload a user's resume to drive
 * @param user owner of the resume
 * @param profile profile of the user
 * @param fileBuffer file contents
 * @returns the fileId of the uploaded file
 */
export const uploadResume = async (
  user: IUser,
  profile: IProfile,
  fileBuffer: Buffer
): Promise<string> => {
  const fileName = `${user._id}.pdf`;
  const name = `${profile.firstName} ${profile.lastName}`;
  if (profile.resume) {
    return await updateInDrive(
      profile.resume,
      fileName,
      "application/pdf",
      fileBuffer,
      name
    );
  } else {
    return await uploadToDrive(fileName, "application/pdf", fileBuffer, name);
  }
};

/**
 * Update an existing file in drive
 * @param fileId Google Drive ID of the file
 * @param fileName Name of the file to upload
 * @param mimeType the mime type of the file being uploaded e.g. application/pdf
 * @param fileBuffer content of the file to upload
 * @param fileDescription an optional semantic description of the file
 * @return the file id of the uploaded file
 */
export const updateInDrive = async (
  fileId: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  fileDescription?: string
): Promise<string> => {
  const auth = await authorize();

  // Convert buffer into stream for upload
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null); // EOF

  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: fileName,
    mimeType,
    description: fileDescription,
  };
  const media = {
    mimeType,
    body: stream,
  };

  const file = await drive.files.update({
    fileId,
    requestBody: fileMetadata,
    media,
    fields: "id",
  });
  return file.data.id;
};

/**
 * Upload a file to Google Drive
 * @param fileName Name of the file to upload
 * @param mimeType the mime type of the file being uploaded e.g. application/pdf
 * @param fileBuffer content of the file to upload
 * @param fileDescription an optional semantic description of the file
 * @return the file id of the uploaded file
 */
export const uploadToDrive = async (
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  fileDescription?: string
): Promise<string> => {
  const auth = await authorize();

  // Convert buffer into stream for upload
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null); // EOF

  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: fileName,
    mimeType,
    parents: [process.env.DRIVE_FOLDER_ID],
    description: fileDescription,
  };
  const media = {
    mimeType,
    body: stream,
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
  });
  const fileId = file.data.id;
  return fileId;
};

/**
 * Authenticate connection with the Google Drive API
 * @return OAuth2Client for interacting with the Google Drive API
 */
const authorize = async (): Promise<OAuth2Client> => {
  const authClient = new google.auth.OAuth2(
    process.env.DRIVE_CLIENT_ID,
    process.env.DRIVE_CLIENT_SECRET,
    redirectUri
  );

  const credentials: Credentials = {
    access_token: process.env.DRIVE_ACCESS_TOKEN,
    refresh_token: process.env.DRIVE_REFRESH_TOKEN,
    scope: SCOPE,
    token_type: "Bearer",
    expiry_date: parseInt(process.env.DRIVE_TOKEN_EXPIRY_DATE) || null,
  };

  const validCredentials = [
    credentials.access_token,
    credentials.refresh_token,
    credentials.expiry_date,
  ].every((el) => el != null);

  if (validCredentials) {
    // Check that credentials are loaded in environment
    authClient.setCredentials(credentials);
  } else {
    // Otherwise, attempt to get new credentials
    console.log("Could not load Google Drive credentials. Retrieving new ones");
    await getAccessToken(authClient);
  }

  return authClient;
};

/**
 * Generate an access token for interacting with Google Drive
 * @param authClient google drive auth client
 */
const getAccessToken = async (authClient: OAuth2Client): Promise<void> => {
  const authUrl = authClient.generateAuthUrl({
    access_type: "offline",
    scope: [SCOPE],
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();

    authClient.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      authClient.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
    });
  });
};
