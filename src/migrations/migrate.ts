import User from "src/models/User";
import { Status } from "src/_enums/Status";

interface StatusObject {
  verified: boolean;
  completedProfile: boolean;
  admitted: boolean;
  confirmed: boolean;
  declined: boolean;
}

/**
 * Convert a StatusObject into a Status enum instance
 */
function statusObjToEnum(status: StatusObject): Status {
  if (status == null) {
    return Status.UNVERIFIED;
  }
  if (status.declined) {
    return Status.DECLINED;
  } else if (status.confirmed) {
    return Status.CONFIRMED;
  } else if (status.admitted === true) {
    return Status.ADMITTED;
  } else if (status.admitted === false) {
    return Status.REJECTED;
  } else if (status.completedProfile) {
    return Status.COMPLETED_PROFILE;
  } else if (status.verified) {
    return Status.VERIFIED;
  } else {
    return Status.UNVERIFIED;
  }
}

/**
 * Migrate the old status objects to new status fields on the User object
 */
export default async function migrateStatus(): Promise<void> {
  const users = await User.aggregate([
    {
      $lookup: {
        from: "statuses",
        localField: "_id",
        foreignField: "user",
        as: "status",
      },
    },
    {
      $unwind: {
        path: "$status",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  const updatedUsers = users.map((user) => ({
    ...user,
    status: statusObjToEnum(user.status),
  }));

  for (const user of updatedUsers) {
    const { email, status } = user;
    await User.findOneAndUpdate(
      { email },
      { $set: { status: status.toString() } }
    );
  }
  console.log("Finished migrating from status objects to enums");
}
