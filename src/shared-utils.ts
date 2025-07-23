// Utils that can be used by renderer OR main programs

// Returns array of millisecond offsets
export function getStartTimes(durationsMs: number[]): number[] {
  const startTimes = new Array(durationsMs.length);
  durationsMs.reduce((accumulator, currentValue, currentIndex) => {
    startTimes[currentIndex] = accumulator;
    return accumulator + currentValue;
  }, 0);
  return startTimes;
}

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Gets the last portion of a path (basename) similar to Node.js's path.basename().
 * Handles both POSIX ('/') and Windows ('\') path separators.
 * Ignores trailing slashes/backslashes.
 *
 * @param filePath The full file path string.
 * @returns The basename of the path.
 */
export function getBasename(
  filePath: string,
  removeExtension: boolean = false
): string {
  // 1. Normalize path: Remove trailing slashes/backslashes unless it's just the root.
  // This ensures 'a/b/' returns 'b', not ''.
  let normalizedPath = filePath;
  if (
    normalizedPath.length > 1 &&
    (normalizedPath.endsWith('/') || normalizedPath.endsWith('\\'))
  ) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // 2. Find the last separator
  const lastSlashIndex = normalizedPath.lastIndexOf('/');
  const lastBackslashIndex = normalizedPath.lastIndexOf('\\');

  const lastSeparatorIndex = Math.max(lastSlashIndex, lastBackslashIndex);

  const baseNameIncludingExtension = normalizedPath.substring(
    lastSeparatorIndex + 1
  );

  if (removeExtension) {
    return baseNameIncludingExtension.replace(/\.[^/.]+$/, '');
  } else {
    return baseNameIncludingExtension;
  }
}

// Not including dot
export function getFileExtension(filename: string) {
  // Find the last dot in the filename
  const lastDotIndex = filename.lastIndexOf('.');

  // If no dot is found, or the dot is the very first character (e.g., ".bashrc")
  // or the dot is the last character (e.g., "filename.")
  if (
    lastDotIndex === -1 ||
    lastDotIndex === 0 ||
    lastDotIndex === filename.length - 1
  ) {
    return ''; // No valid extension
  }

  // Slice the string from the character after the last dot
  return filename.substring(lastDotIndex + 1);
}

// To be used as second argument to JSON.stringify
export interface FilterPrivatePropertiesThis {
  [key: string]: unknown;
}

export function filterPrivateProperties(
  this: FilterPrivatePropertiesThis,
  key: string,
  value: unknown
): unknown {
  // `this` refers to the object containing the property being processed.
  // `key` is the name of the property.
  // `value` is the value of the property.

  // Skip the root object's key (which is an empty string)
  if (key === '') {
    return value;
  }

  // If the key starts with an underscore, return undefined to omit it
  if (key.startsWith('_')) {
    return undefined;
  }

  // Otherwise, return the value as is
  return value;
}
