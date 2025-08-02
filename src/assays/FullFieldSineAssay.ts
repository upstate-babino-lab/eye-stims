import { RangeSpec } from './RangeSpec';
import { AssayType, Assay } from './Assay';
import { FFSine, Stimulus } from '@stims/index';

export class FullFieldSineAssay extends Assay {
  means: RangeSpec = new RangeSpec({ start: 50, step: 10, nSteps: 2 });
  mContrasts: RangeSpec = new RangeSpec({
    start: 90,
    step: -10,
    nSteps: 4,
  });
  frequencies: RangeSpec = new RangeSpec({
    start: 1,
    step: 2,
    nSteps: 4,
  });

  constructor(props: Partial<FullFieldSineAssay> = {}) {
    // TODO: Check that props are all in valid ranges
    super({
      ...props,
      assayType: AssayType.FullFieldSine,
    });
    this.means = (props.means && new RangeSpec(props.means)) ?? this.means;
    this.mContrasts =
      (props.mContrasts && new RangeSpec(props.mContrasts)) ?? this.mContrasts;
    this.frequencies =
      (props.frequencies && new RangeSpec(props.frequencies)) ?? this.frequencies;
  }

  baseStimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    const means = this.means?.list;
    const contrasts = this.mContrasts?.list;
    const frequencies = this.frequencies?.list;
    for (let rep = 0; rep < this.nRepetitions; rep++) {
      for (const m of means) {
        for (const f of frequencies) {
          for (const c of contrasts) {
            const pojo = {
              durationMs: this.bodyMs + this.tailMs,
              bodyMs: this.bodyMs,
              tailMs: this.tailMs,
              bgColor: 'black',
              m: m,
              c: c,
              hz: f,
            };
            stimuli.push(new FFSine(pojo));
          }
        }
      }
    }
    return stimuli;
  }
}
