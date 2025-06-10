#!/usr/bin/env -S ts-node -r tsconfig-paths/register
/*
  "Trailblazer" spec to create our first useful video and .stims.json for
  complete processing of stimulations to data collection to analysis of
  retinal acuity, using all our new systems and code.
*/
import { SqrGratingStimsSpec, RangeSpec } from '@specs/index';

const stimsSpec = new SqrGratingStimsSpec({
  name: 'Blazer',
  description: 'Trailblazer stims.json for first video',
  bodyMs: 260,
  tailMs: 520,
  grayMs: 60,
  grayTailMs: 520,
  cpds: new RangeSpec({
    start: 0.5,
    step: 0.5,
    nSteps: 5,
  }),
  contrasts: new RangeSpec({
    start: 0,
    step: -0.1,
    nSteps: 3,
  }),
  speeds: new RangeSpec({
    start: 10,
    step: 1,
    nSteps: 2,
  }),
  nRepetitions: 40,
  integrityFlashIntervalMins: 10,
  restMinutesAfterIntegrityFlash: 4,
});

const stimuli = stimsSpec.stimuli();
console.error(
  `Created ${stimuli.length} stimuli ` +
    `with stims total duration >${(stimsSpec.bodyMs * stimuli.length * 2) / (1000 * 60)} minutes`
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
