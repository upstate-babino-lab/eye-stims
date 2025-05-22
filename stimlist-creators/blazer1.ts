#!/usr/bin/env -S ts-node -r tsconfig-paths/register
/*
  "Trailblazer" to create our first useful video and .stims.json for
  complete processing from stimulation to data collection to analysis of
  retinal acuity, using all our new systems and code.
*/
import { SqrGratingStimsSpec, RangeSpec } from '@specs/index';

const stimsSpec = new SqrGratingStimsSpec({
  name: 'Blazer',
  description: 'Trailblazer stims.json for first video',
  bodyMs: 260, // Total duration of each stimulus will be 2 * bodyMs
  cpds: new RangeSpec({
    start: 0.5,
    step: 0.5,
    nSteps: 5,
  }),
  contrasts: new RangeSpec({
    start: 0,
    step: -0.1,
    nSteps: 6,
  }),
  speeds: new RangeSpec({
    start: 10,
    step: 1,
    nSteps: 1, // Only one speed for now
  }),
  nRepetitions: 40,
  integrityFlashIntervalMins: 5,
});

const stimuli = stimsSpec.stimuli();
console.error(
  `Created ${stimuli.length} stimuli ` +
    `with total duration ${(stimsSpec.bodyMs * stimuli.length * 2) / (1000 * 60)} minutes`
);

// Print to stdout to save as .stims.json file
console.log(
  JSON.stringify(
    {
      name: stimsSpec.name,
      description: stimsSpec.description,
      stimuli: stimuli,
    },
    null,
    4
  )
);
