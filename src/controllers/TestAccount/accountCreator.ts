import { ObjectId } from "bson";
import { LeanDocument } from "mongoose";
import {
  animals,
  colors,
  names,
  uniqueNamesGenerator,
} from "unique-names-generator";
import Profile from "../../models/Profile";
import User from "../../models/User";
import pickRandom from "../../util/pickRandom";
import { Ethnicity, Gender } from "../../_enums/Profile";
import { doesStatusImply, Status } from "../../_enums/Status";
import { IProfile } from "../../_types/Profile";
import { IUser } from "../../_types/User";
import { getTartanHacks } from "../EventController";

export interface TestAccount {
  _id: ObjectId;
  email: string;
  password: string;
  status: Status;
  token: string;
  profile?: LeanDocument<IProfile>;
}

const schools = [
  "Carnegie Mellon University",
  "Crimson Magenta University",
  "Carved Watermelon University",
  "Marvel Cinematic Universe",
  "Carnegie Carnegie Carnegie",
];

/**
 * Create a new test account with the specified status
 */
export async function createTestAccountWithStatus(
  status: Status
): Promise<TestAccount> {
  const prefix = uniqueNamesGenerator({
    dictionaries: [names, colors],
    separator: "-",
    length: 2,
  });
  const email = `${prefix}@tartanhacks.com`.toLowerCase();
  const password = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    length: 2,
    separator: "-",
  });
  const hash = User.generateHash(password);

  const user = new User({ email, password: hash, status });
  await user.save();

  let profile: IProfile | undefined = undefined;
  if (doesStatusImply(status, Status.COMPLETED_PROFILE) || status === Status.WAITLISTED) {
    profile = await createTestProfileForUser(user);

    if (doesStatusImply(status, Status.CONFIRMED)) {
      profile.confirmation = {
        signatureLiability: true,
        signatureCodeOfConduct: true,
        willMentor: false,
      };
      await profile.save();
    }
  }

  const token = await user.generateAuthToken();

  return {
    ...user.toJSON(),
    password,
    token,
    profile,
  };
}

/**
 * Create a completed profile for a user
 */
export async function createTestProfileForUser(user: IUser): Promise<IProfile> {
  const event = await getTartanHacks();
  const email = user.email;
  const displayName = email.split("@")[0];
  const [firstName, lastName] = displayName.split("-");
  const school = pickRandom(schools);

  const profile = new Profile({
    event: event._id,
    user: user._id,
    firstName,
    lastName,
    displayName,
    age: pickRandom([18, 19, 20, 21, 22, 23, 24]),
    school,
    graduationYear: 2024,
    gender: pickRandom(Object.values(Gender)),
    ethnicity: pickRandom(Object.values(Ethnicity)),
    phoneNumber: "1234567890",
    github: displayName,
  });
  await profile.save();

  return profile;
}
