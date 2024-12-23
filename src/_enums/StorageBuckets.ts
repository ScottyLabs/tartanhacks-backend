export enum StorageBucket {
  RESUME = "2025-resumes",
  PROFILE_PICTURES = "2025-profile-pictures",
}

/**
 * Return the storage bucket for the current NODE_ENV
 */
export function getStorageBucket(bucket: StorageBucket): string {
  let suffix;
  switch (process.env.NODE_ENV) {
    case "dev":
      suffix = "-dev";
      break;

    case "stg":
      suffix = "-stg";
      break;

    case "prod":
      suffix = "";
      break;
  }

  return bucket + suffix;
}
