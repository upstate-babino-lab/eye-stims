#!/usr/bin/env -S ts-node -r tsconfig-paths/register
/*
  "Trailblazer" spec to create our first useful video and .stims.json for
  complete processing of stimulations to data collection to analysis of
  retinal acuity, using all our new systems and code.
*/
import { SqrGratingAssay, RangeSpec } from '../src/assays/index';
import { frameWithBlack } from '@stims/stim-utils';

const stimsSpec = new SqrGratingAssay({
  title: 'Blazer4',
  description:
    'Pairs of gratings moving left and right for each cpd, contrast, and speed.',
  bodyMs: 260,
  tailMs: 520,
  grayMs: 60,
  grayTailMs: 520,
  includeStaticGratings: true,
  nRepetitions: 40,
  integrityFlashIntervalMins: 5,
  restIntervalMins: 1,
  cpds: new RangeSpec({
    start: 0.3,
    step: 0.2,
    nSteps: 5,
  }),
  contrasts: new RangeSpec({
    start: 0,
    step: -0.1,
    nSteps: 3,
  }),
  speeds: new RangeSpec({
    start: 3,
    step: 1,
    nSteps: 2,
  }),
});

const stimuli = frameWithBlack(stimsSpec.stimuli());
console.error(
  `Created ${stimuli.length} stimuli ` +
    `with stims total duration >${(stimsSpec.bodyMs * stimuli.length * 2) / (1000 * 60)} minutes`
);

// Print to stdout to save as .stims.json file
console.log(
  JSON.stringify(
    {
      title: stimsSpec.title,
      description: stimsSpec.description,
      stimuli: stimuli,
    },
    null,
    4
  )
);
