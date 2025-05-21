/*
  A StimsSpec is used to create a list of POJO stimuli
  that can be saved to a .stims.json file or to create a StimSequence
*/
import { Stimulus, SqrGrating } from '@stims/index';
import { RangeSpec } from './RangeSpec';

// TODO: Create StimSpec subclasses for each type of StimSpec

export enum StimSpecType {
  SinGratings = 'Sinusoidal Gratings',
  SqrGratings = 'Square Gratings',
}
export class StimsSpec {
  name: string = 'Uninitialized StimsSpec';
  description: string = '';
  stimSpecType: StimSpecType = StimSpecType.SqrGratings;
  specType: string = '';
  cpds: RangeSpec = new RangeSpec({ start: 0.01, step: 0.02, nSteps: 1 });
  contrasts: RangeSpec = new RangeSpec({ start: 0, step: 1, nSteps: 1 });
  speeds: RangeSpec = new RangeSpec({ start: 10, step: 1, nSteps: 1 });
  integrityFlashIntervalMins: number = 0;

  constructor(props: Partial<StimsSpec> = {}) {
    this.name = props.name ?? this.name;
    this.description = props.description ?? this.description;
    this.stimSpecType = props.stimSpecType ?? this.stimSpecType;
    this.specType = props.specType ?? this.specType;
    this.cpds = props.cpds ?? this.cpds;
    this.contrasts = props.contrasts ?? this.contrasts;
    this.speeds = props.speeds ?? this.speeds;
    this.integrityFlashIntervalMins =
      props.integrityFlashIntervalMins ?? this.integrityFlashIntervalMins;
  }

  stimuli(): Stimulus[] {
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
