import { Solid } from './Solid';
import { Stimulus } from './Stimulus';
import RangeSpec from './RangeSpec';

enum StimSpecType {
  SinGratings = 'Sinusoidal Gratings',
  SqrGratings = 'Square Gratings',
}
export class StimsSpec {
  stimSpecType: StimSpecType = StimSpecType.SqrGratings;
  specType: string = '';
  cpds: RangeSpec = new RangeSpec({ start: 0.1, step: 0.1, nSteps: 1 });
  contrasts: RangeSpec = new RangeSpec({ start: 0, step: 1, nSteps: 1 });
  speeds: RangeSpec = new RangeSpec({ start: 10, step: 1, nSteps: 1 });
  integrityFlashIntervalMins: number = 0;
  repetitions: number = 1;

  constructor(props: Partial<StimsSpec> = {}) {
    this.stimSpecType = props.stimSpecType ?? this.stimSpecType;
    this.specType = props.specType ?? this.specType;
    this.cpds = props.cpds ?? this.cpds;
    this.contrasts = props.contrasts ?? this.contrasts;
    this.speeds = props.speeds ?? this.speeds;
    this.integrityFlashIntervalMins =
      props.integrityFlashIntervalMins ?? this.integrityFlashIntervalMins;
    this.repetitions = props.repetitions ?? this.repetitions;
  }

  stimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    const cpds = this.cpds?.list;
    const contrasts = this.contrasts?.list;
    const speeds = this.speeds?.list;
    for (const num1 of cpds) {
      for (const num2 of contrasts) {
        for (const num3 of speeds) {
          const stim = new Solid({
            durationMs: 1000,
            bgColor: 'green',
            meta: { num1: num1, num2: num2, num3: num3 },
          });
          stimuli.push(stim);
        }
      }
    }
    return stimuli;
  }
}
