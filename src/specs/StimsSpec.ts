/*
  A StimsSpec is used to create a list of POJO stimuli
  that can be saved to a .stims.json file or to create a StimSequence
*/
import { Stimulus, SqrGrating } from '@stims/index';
import { RangeSpec } from './RangeSpec';

// TODO: Create StimSpec subclasses for each type of StimSpec

export enum StimSpecType {
  SqrGratings = 'SqrGratings',
  // SinGratings = 'SinGratings',
}

type StimsSpecProps = {
  stimSpecType: StimSpecType;
  name?: string;
  description?: string;
  integrityFlashIntervalMins?: number;
};
export abstract class StimsSpec {
  stimSpecType: StimSpecType = Object.values(StimSpecType)[0];
  name: string = '';
  description: string = '';
  integrityFlashIntervalMins?: number = 0;

  constructor(props: StimsSpecProps) {
    this.stimSpecType = props.stimSpecType ?? this.stimSpecType;
    this.name = props.name ?? this.name;
    this.description = props.description ?? this.description;
    this.integrityFlashIntervalMins =
      props.integrityFlashIntervalMins ?? this.integrityFlashIntervalMins;
  }

  abstract orderedStimuli(): Stimulus[];

  stimuli(): Stimulus[] {
    const shuffledStims = this.orderedStimuli().sort(() => Math.random() - 0.5); // in-place shuffle
    if (this.integrityFlashIntervalMins && this.integrityFlashIntervalMins > 0) {
      // TODO: Insert integrity flashes at intervals of this.integrityFlashIntervalMins
    }
    return shuffledStims;
  }
}

export class SqrGratingStimsSpec extends StimsSpec {
  cpds: RangeSpec = new RangeSpec({ start: 0.01, step: 0.02, nSteps: 1 });
  contrasts: RangeSpec = new RangeSpec({ start: 0, step: 1, nSteps: 1 });
  speeds: RangeSpec = new RangeSpec({ start: 10, step: 1, nSteps: 1 });

  constructor(props: Partial<SqrGratingStimsSpec> = {}) {
    super({ ...props, stimSpecType: StimSpecType.SqrGratings });
    this.cpds = props.cpds ?? this.cpds;
    this.contrasts = props.contrasts ?? this.contrasts;
    this.speeds = props.speeds ?? this.speeds;
  }

  orderedStimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    const cpds = this.cpds?.list;
    const contrasts = this.contrasts?.list;
    const speeds = this.speeds?.list;
    for (const cpd of cpds) {
      for (const speed of speeds) {
        for (const contrast of contrasts) {
          const stim = new SqrGrating({
            cpd: cpd,
            durationMs: 1000,
            bgColor: 'green',
            meta: { num1: cpd, num2: contrast, num3: speed },
          });
          stimuli.push(stim);
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
  // SinGratings: SinGratingStimsSpec,
};

// Create a new StimsSpec class instance from POJO or parsed JSON object.
export function newStimSpec(stimSpec: Partial<StimsSpec>) {
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
