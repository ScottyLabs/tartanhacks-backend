/**
 * Service for uploading files to Google Drive
 */
import { Credentials, OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { promisify } from "util";
import readline from "readline";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_PATH = "token.json";
const redirectUri = "urn:ietf:wg:oauth:2.0:oob";

/**
 * Upload a file to Google Drive
 * @param fileName Name of the file to upload
 * @param dataUrl data URL of the file to upload
 * @param profile profile of the user associated with this file
 */
export const uploadToDrive = async (fileName, dataUrl, profile) => {
  const clientId = process.env.DRIVE_CLIENT_ID;
  const clientSecret = process.env.DRIVE_CLIENT_SECRET;

  const authClient = await authorize(clientId, clientSecret, redirectUri);
};

/**
 * Authenticate connection with the Google Drive API
 * @param clientId
 * @param clientSecret
 * @param redirectUri
 * @returns
 */
const authorize = async (
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuth2Client> => {
  const authClient = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  const token: Credentials = {
    access_token: process.env.DRIVE_ACCESS_TOKEN,
    refresh_token: process.env.DRIVE_REFRESH_TOKEN,
    scope: "https://www.googleapis.com/auth/drive.file",
    token_type: "Bearer",
    expiry_date: parseInt(process.env.DRIVE_TOKEN_EXPIRY_DATE),
  };
  authClient.setCredentials(token);

  return authClient;
};

/**
 * Generate an access token for interacting with Google Drive
 * @param authClient google drive auth client
 */
const getAccessToken = async (authClient: OAuth2Client): Promise<void> => {
  const authUrl = authClient.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
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