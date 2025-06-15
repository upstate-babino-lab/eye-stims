/*
  A StimsSpec is used to create a list of POJO stimuli
  that can be saved to a .stims.json file or used to create a StimSequence
*/
import { Stimulus, SqrGrating, Solid } from '@stims/index';
import { RangeSpec } from './RangeSpec';
import { contrastPair, linearToHex } from '@stims/stim-utils';
import { NestedStimuli } from '@stims/Stimulus';

// TODO: Create StimSpec subclasses for each type of StimSpec
export enum StimSpecType {
  SqrGratingPairs = 'SqrGratingPairs',
  TBD = 'TBD',
}

type StimSpecInfo = {
  description: string;
};
export const stimSpecsInfo: Record<StimSpecType, StimSpecInfo> = {
  SqrGratingPairs: {
    description:
      'Pairs of gratings moving left and right ' +
      'for each cpd, contrast, and speed.',
  },
  TBD: {
    description: 'To be determined',
  },
};

type StimsSpecProps = {
  stimSpecType: StimSpecType;
  title?: string;
  description?: string;
  // Duration of body and tail in milliseconds
  // Total duration of each Stimulus will be
  // head(0) + body + tail = (2 * bodyMs)
  bodyMs?: number; // Multiple of 20
  tailMs?: number; // Multiple of 20
  grayMs?: number;
  grayTailMs?: number;
  includeStaticGratings?: boolean;
  nRepetitions?: number; // Number of repetitions of the whole sequence
  integrityFlashIntervalMins?: number;
  restMinutesAfterIntegrityFlash?: number;
};
export abstract class StimsSpec {
  stimSpecType: StimSpecType = Object.values(StimSpecType)[0];
  title: string = '';
  description: string = '';
  bodyMs: number = 260;
  tailMs: number = 520;
  grayMs: number = 60;
  grayTailMs: number = 520; // only used if grayMs > 0
  includeStaticGratings = false;
  nRepetitions: number = 1;
  integrityFlashIntervalMins: number = 0;
  restMinutesAfterIntegrityFlash: number = 1;
  private _stimsCache: Stimulus[] = [];
  private _jsonCache: string = '';

  constructor(props: StimsSpecProps) {
    this.stimSpecType = props.stimSpecType ?? this.stimSpecType;
    this.title = props.title ?? this.title;
    this.description =
      props.description ??
      (this.description || stimSpecsInfo[this.stimSpecType].description);
    this.bodyMs = props.bodyMs ?? this.bodyMs;
    this.tailMs = props.tailMs ?? this.tailMs;
    this.grayMs = props.grayMs ?? this.grayMs;
    this.grayTailMs = this.grayMs > 0 ? (props.grayTailMs ?? this.grayTailMs) : 0;
    this.includeStaticGratings =
      props.includeStaticGratings ?? this.includeStaticGratings;
    this.nRepetitions = props.nRepetitions ?? this.nRepetitions;
    this.integrityFlashIntervalMins =
      props.integrityFlashIntervalMins ?? this.integrityFlashIntervalMins;
    this.restMinutesAfterIntegrityFlash =
      props.restMinutesAfterIntegrityFlash ?? this.restMinutesAfterIntegrityFlash;
  }

  // Returns POJOs not randomized, without integrity flashes or rest periods
  abstract baseStimuli(): NestedStimuli;

  // TODO: return from private cache if JSON has not changed?
  // If we don't use a cache stims will be reshuffled every time.
  stimuli(): Stimulus[] {
    // Shuffle groups before inserting integrity flashes
    const shuffledNestedStims = this.baseStimuli().sort(() => Math.random() - 0.5); // in-place shuffle

    if (this.integrityFlashIntervalMins && this.integrityFlashIntervalMins > 0) {
      const integrityFlashGroup = [
        new Solid({ bgColor: 'white', durationMs: 1260, bodyMs: 260 }),
        new Solid({ bgColor: 'red', durationMs: 1260, bodyMs: 260 }),
        new Solid({ bgColor: 'green', durationMs: 1260, bodyMs: 260 }),
        new Solid({ bgColor: 'blue', durationMs: 1260, bodyMs: 260 }),
      ];
      const nStimsIntegrityInterval = Math.round(
        (this.integrityFlashIntervalMins * 60 * 1000) / (this.bodyMs * 2)
      );
      const augmentedStims = shuffledNestedStims.reduce(
        (acc: NestedStimuli, stim, i) => {
          if (i % nStimsIntegrityInterval === 0) {
            acc.push(integrityFlashGroup);
            if (i > 0 && this.restMinutesAfterIntegrityFlash > 0) {
              // Add a rest period after the integrity flash

              // BUG! BUG! single long Solid duration crashes the program
              // Perhaps because the audio is to long?
              for (let min = 0; min < this.restMinutesAfterIntegrityFlash; min++) {
                // Add one minute of rest
                acc.push(new Solid({ bgColor: 'black', durationMs: 60 * 1000 }));
              }
            }
          }
          acc.push(stim); // Push the current stimulus or stimulus group
          return acc;
        },
        [] as Stimulus[]
      ); // Start with empty accumulator
      return augmentedStims.flat(10) as Stimulus[]; // Flatten the nested arrays
    }
    return shuffledNestedStims.flat(10) as Stimulus[]; // Without integrity flashes
  }
}

export class SqrGratingPairsStimsSpec extends StimsSpec {
  cpds: RangeSpec = new RangeSpec({ start: 0.3, step: 0.2, nSteps: 1 });
  contrasts: RangeSpec = new RangeSpec({ start: 0, step: -0.1, nSteps: 1 });
  speeds: RangeSpec = new RangeSpec({ start: 3, step: 1, nSteps: 1 });

  constructor(props: Partial<SqrGratingPairsStimsSpec> = {}) {
    // TODO: Check that cpds, contrasts, and speeds are all in valid ranges
    super({
      ...props,
      stimSpecType: StimSpecType.SqrGratingPairs,
    });
    this.cpds = (props.cpds && new RangeSpec(props.cpds)) ?? this.cpds;
    this.contrasts =
      (props.contrasts && new RangeSpec(props.contrasts)) ?? this.contrasts;
    this.speeds = (props.speeds && new RangeSpec(props.speeds)) ?? this.speeds;
  }

  baseStimuli(): NestedStimuli {
    const nestedStimuli: NestedStimuli = [];
    const cpds = this.cpds?.list;
    const contrasts = this.contrasts?.list;
    const speeds = this.speeds?.list;
    for (let rep = 0; rep < this.nRepetitions; rep++) {
      for (const cpd of cpds) {
        for (const speed of speeds) {
          for (const contrast of contrasts) {
            const stimSet: NestedStimuli = [];
            // Push pair of matching stimuli with opposite speeds
            const [fgColor, bgColor] = contrastPair(contrast);
            const gratingPojo = {
              cpd: cpd,
              durationMs: this.bodyMs + this.tailMs,
              bodyMs: this.bodyMs,
              tailMs: this.tailMs,
              bgColor: bgColor,
              fgColor: fgColor,
              speed: speed,
              meta: { contrast: contrast },
            };
            stimSet.push(new SqrGrating(gratingPojo)); // First stimulus
            // Second stimulus identical but with opposite speed
            stimSet.push(
              new SqrGrating({
                ...gratingPojo,
                speed: -speed,
              })
            );
            if (this.includeStaticGratings) {
              // Third stimulus identical but not moving
              stimSet.push(
                new SqrGrating({
                  ...gratingPojo,
                  speed: 0,
                })
              );
            }
            if (!this.grayMs) {
              nestedStimuli.push(stimSet);
            } else {
              const greyStim = new Solid({
                durationMs: this.grayMs + this.grayTailMs,
                bodyMs: this.grayMs,
                tailMs: this.grayTailMs,
                bgColor: linearToHex(0.5), // Grey color
              });
              nestedStimuli.push(stimSet.map((stim) => [stim, greyStim]));
            }
          }
        }
      }
    }
    return nestedStimuli;
  }
}

// Map of constructors that create new StimsSpec class objects (with methods)
// from simple parsed JSON POJOs (with no methods) using lookup by name.
// Every possible StimSpecType must be assigned or thankfully, Typescript complains.
type StimsSpecConstructors = {
  [key in StimSpecType]: new (args: Partial<StimsSpecProps>) => StimsSpec;
};
export const stimsSpecConstructors: StimsSpecConstructors = {
  SqrGratingPairs: SqrGratingPairsStimsSpec,
  TBD: SqrGratingPairsStimsSpec, // Placeholder just for now
};

// Create a new StimsSpec class instance from POJO or parsed JSON object.
export function newStimSpec(stimSpec: Partial<StimsSpec>): StimsSpec {
  if (!stimSpec.stimSpecType) {
    throw new Error(`newStimSpec(): Missing stimSpecType`);
  }
  const isValidStimType =
    stimSpec && Object.values(StimSpecType).includes(stimSpec.stimSpecType);
  if (!isValidStimType) {
    throw new Error(
      `newStimSpec(): StimSpecType '${stimSpec.stimSpecType}' not found`
    );
  }
  const constructor = stimsSpecConstructors[stimSpec.stimSpecType];
  return new constructor(stimSpec);
}
