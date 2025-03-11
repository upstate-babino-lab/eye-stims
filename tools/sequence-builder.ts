// Run as follows:
// npx ts-node sequence-builder.ts > stim-50000.jsonl

import { Bar } from '../src/renderer/src/stimulus';

for (let i = 0; i < 50000; i++) {
  const stim = new Bar();
  console.log(JSON.stringify(stim));
}
