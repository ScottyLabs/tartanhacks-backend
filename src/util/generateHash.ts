import { genSaltSync, hashSync } from "bcrypt";

/**
 * Generate the hash of a source string
 * @param source String to hash
 */
export default function generateHash(source: string): string {
  return hashSync(source, genSaltSync(8));
}
