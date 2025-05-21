// Import for compatibility with eye-candy programming language (EPL) code

import * as stims from '@stims/index';
export { stims };
export type NestedStimuli = (stims.Stimulus | NestedStimuli)[];

export const r = {
  uuid: () => crypto.randomUUID(),
  randi: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  shuffle: (array: unknown[]) => array.sort(() => Math.random() - 0.5), // in-place
};
