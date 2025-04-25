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
