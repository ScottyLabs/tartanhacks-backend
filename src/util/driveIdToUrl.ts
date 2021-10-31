/**
 * Convert a Google Drive file id to a downloadable URL
 * @param id Google Drive File ID
 * @returns a directly downloadable URL
 */
export const driveIdToUrl = (id: string): string => {
  return `https://drive.google.com/uc?export=download&id=${id}`;
};
