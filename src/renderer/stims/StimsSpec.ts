import { Stimulus } from './Stimulus';
import RangeSpec from './RangeSpec';
import { SqrGrating } from './SqrGrating';

enum StimSpecType {
  SinGratings = 'Sinusoidal Gratings',
  SqrGratings = 'Square Gratings',
}
export class StimsSpec {
  stimSpecType: StimSpecType = StimSpecType.SqrGratings;
  specType: string = '';
  cpds: RangeSpec = new RangeSpec({ start: 0.01, step: 0.02, nSteps: 1 });
  contrasts: RangeSpec = new RangeSpec({ start: 0, step: 1, nSteps: 1 });
  speeds: RangeSpec = new RangeSpec({ start: 10, step: 1, nSteps: 1 });
  integrityFlashIntervalMins: number = 0;

  constructor(props: Partial<StimsSpec> = {}) {
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
