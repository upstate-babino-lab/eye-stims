/*
  A StimsSpec is used to create a list of POJO stimuli
  that can be saved to a .stims.json file or used to create a StimSequence
*/
import { Stimulus, SqrGrating, Solid } from '@stims/index';
import { RangeSpec } from './RangeSpec';
import { contrastPair } from '@stims/stim-utils';

// TODO: Create StimSpec subclasses for each type of StimSpec
export enum StimSpecType {
  SqrGratings = 'SqrGratings',
  TBD = 'TBD',
}

type StimsSpecProps = {
  stimSpecType: StimSpecType;
  name?: string;
  description?: string;
  // Duration of body and tail in milliseconds
  // Total duration of each Stimulus will be
  // head(0) + body + tail = (2 * bodyMs)
  bodyMs?: number; // Multiple of 20
  tailMs?: number; // Multiple of 20
  nRepetitions?: number; // Number of repetitions of the whole sequence
  integrityFlashIntervalMins?: number;
  restMinutesAfterIntegrityFlash?: number;
};
export abstract class StimsSpec {
  stimSpecType: StimSpecType = Object.values(StimSpecType)[0];
  name: string = '';
  description: string = '';
  bodyMs: number = 260;
  tailMs: number = 520;
  nRepetitions: number = 1;
  integrityFlashIntervalMins: number = 0;
  restMinutesAfterIntegrityFlash: number = 1;
  private _stimsCache: Stimulus[] = [];
  private _jsonCache: string = '';

  constructor(props: StimsSpecProps) {
    this.stimSpecType = props.stimSpecType ?? this.stimSpecType;
    this.name = props.name ?? this.name;
    this.description = props.description ?? this.description;
    this.bodyMs = props.bodyMs ?? this.bodyMs;
    this.tailMs = props.tailMs ?? this.tailMs;
    this.nRepetitions = props.nRepetitions ?? this.nRepetitions;
    this.integrityFlashIntervalMins =
      props.integrityFlashIntervalMins ?? this.integrityFlashIntervalMins;
    this.restMinutesAfterIntegrityFlash =
      props.restMinutesAfterIntegrityFlash ?? this.restMinutesAfterIntegrityFlash;
  }

  // Returns POJOs not randomized, without integrity flashes or rest periods
  abstract baseStimuli(): Stimulus[];

  // Would be more efficient to calculate instead of regenerate stimuli every time
  count(): number {
    return this.stimuli().length;
  }
  // Would be more efficient to calculate instead of regenerate stimuli every time
  duration(): number {
    return this.stimuli().reduce((acc, stim) => acc + stim.durationMs, 0);
  }

  // TODO: return from private cache if JSON has not changed
  stimuli(): Stimulus[] {
    // Shuffle before inserting integrity flashes at regular intervals
    const shuffledStims = this.baseStimuli().sort(() => Math.random() - 0.5); // in-place shuffle

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
      const augmentedStims = shuffledStims.reduce((acc, stim, i) => {
        if (i % nStimsIntegrityInterval === 0) {
          acc.push(...integrityFlashGroup);
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
        acc.push(stim); // Push the current stimulus
        return acc;
      }, [] as Stimulus[]); // Start with empty accumulator
      return augmentedStims;
    }
    return shuffledStims; // Without integrity flashes
  }
}

export class SqrGratingStimsSpec extends StimsSpec {
  cpds: RangeSpec = new RangeSpec({ start: 0.2, step: 0.2, nSteps: 1 });
  contrasts: RangeSpec = new RangeSpec({ start: 0, step: -0.1, nSteps: 1 });
  speeds: RangeSpec = new RangeSpec({ start: 3, step: 1, nSteps: 1 });

  constructor(props: Partial<SqrGratingStimsSpec> = {}) {
    // TODO: Check that cpds, contrasts, and speeds are all in valid ranges
    super({
      ...props,
      stimSpecType: StimSpecType.SqrGratings,
    });
    this.cpds = (props.cpds && new RangeSpec(props.cpds)) ?? this.cpds;
    this.contrasts =
      (props.contrasts && new RangeSpec(props.contrasts)) ?? this.contrasts;
    this.speeds = (props.speeds && new RangeSpec(props.speeds)) ?? this.speeds;
  }

  baseStimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    const cpds = this.cpds?.list;
    const contrasts = this.contrasts?.list;
    const speeds = this.speeds?.list;
    for (let rep = 0; rep < this.nRepetitions; rep++) {
      for (const cpd of cpds) {
        for (const speed of speeds) {
          for (const contrast of contrasts) {
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
            stimuli.push(new SqrGrating(gratingPojo));
            // Second stimulus identical but with opposite speed
            stimuli.push(
              new SqrGrating({
                ...gratingPojo,
                speed: -speed,
              })
            );
          }
        }
      }
    }
    return stimuli;
  }
}

// Map of constructors that create new StimsSpec class objects (with methods)
// from simple parsed JSON POJOs (with no methods) using lookup by name.
// Each StimsSpec must be assigned or thankfully, Typescript complains.
type StimsSpecConstructors = {
  [key in StimSpecType]: new (args: Partial<StimsSpec>) => StimsSpec;
};
export const stimsSpecConstructors: StimsSpecConstructors = {
  SqrGratings: SqrGratingStimsSpec,
  TBD: SqrGratingStimsSpec, // Placeholder just for now
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
