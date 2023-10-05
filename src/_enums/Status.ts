/**
 * Possible states a User can be in
 */
export enum Status {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED = "VERIFIED",
  COMPLETED_PROFILE = "COMPLETED_PROFILE",
  ADMITTED = "ADMITTED",
  REJECTED = "REJECTED",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
  WAITLISTED = "WAITLISTED",
}

const statusLevelMapping = [
  [Status.UNVERIFIED],
  [Status.VERIFIED],
  [Status.COMPLETED_PROFILE],
  [Status.ADMITTED, Status.REJECTED],
  [Status.WAITLISTED],
  [Status.CONFIRMED, Status.DECLINED],
];

/**
 * Returns the level of the specified status.
 * Statuses of the same level correspond to different outcomes a user might end up in after some action.
 * If a status has a higher level than a previous level, then the previous action must have already occured
 */
export function getStatusLevel(status: Status): number {
  const level = statusLevelMapping.findIndex((statuses) =>
    statuses.includes(status)
  );

  if (level === -1) {
    throw new Error(`Unknown status: ${status}`);
  }

  return level;
}

/**
 * Returns true if having `srcStatus` implies having `cmpStatus`
 */
export function doesStatusImply(srcStatus: Status, cmpStatus: Status): boolean {
  const srcStatusLevel = getStatusLevel(srcStatus);
  const cmpStatusLevel = getStatusLevel(cmpStatus);
  const exactEqualityStates = [Status.REJECTED, Status.WAITLISTED];

  if (
    exactEqualityStates.includes(srcStatus) ||
    exactEqualityStates.includes(cmpStatus)
  ) {
    // If either status is REJECTED or WAITLISTED, only return true if other is the same
    return srcStatus === cmpStatus;
  }

  // Either srcStatus has higher level, or equal level and equal value
  return (
    srcStatusLevel > cmpStatusLevel ||
    (srcStatusLevel === cmpStatusLevel && srcStatus === cmpStatus)
  );
}
