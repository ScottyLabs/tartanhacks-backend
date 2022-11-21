/**
 * Select a random item from a list of elements
 */
export default function pickRandom<T>(elements: T[]): T {
  if (elements.length == 0) {
    throw new Error("Cannot select a random element from an empty array!");
  }

  const index = Math.floor(Math.random() * elements.length);
  return elements[index];
}
