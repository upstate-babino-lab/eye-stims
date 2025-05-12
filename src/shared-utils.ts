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

  // 3. Extract the part after the last separator
  if (lastSeparatorIndex === -1) {
    return normalizedPath; // No separator, so the whole string is the basename
  }

  const baseNameIncludingExtension = normalizedPath.substring(
    lastSeparatorIndex + 1
  );

  if (removeExtension) return baseNameIncludingExtension.replace(/\.[^/.]+$/, '');
  else {
    return baseNameIncludingExtension;
  }
}
