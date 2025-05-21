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
  cpds: new RangeSpec({
    start: 0.5,
    step: 0.5,
    nSteps: 5,
  }),
  contrasts: new RangeSpec({
    start: 0.1,
    step: 0.1,
    nSteps: 5,
  }),
  speeds: new RangeSpec({
    start: 0.5,
    step: 0.5,
    nSteps: 5,
  }),
  integrityFlashIntervalMins: 5,
});

const stimuli = stimsSpec.stimuli();

// Print output to stdout to save as .stims.json file
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
