import { Stimulus } from '@stims/Stimulus';
import { RangeSpec } from './RangeSpec';
import { AssayType, Assay } from './Assay';
import { contrastPair } from '@stims/stim-utils';
import { Checkerboard } from '@stims/Checkerboard';

export class CheckerboardsAssay extends Assay {
  cpds: RangeSpec = new RangeSpec({ start: 0.1, step: 0.1, nSteps: 3 }); // TODO? add min/max
  contrasts: RangeSpec = new RangeSpec({
    start: 90,
    step: -10,
    nSteps: 4,
    min: 0,
    max: 100,
  });

  constructor(props: Partial<CheckerboardsAssay> = {}) {
    // TODO: Check that cpds & contrasts are all in valid ranges
    super({
      ...props,
      assayType: AssayType.Checkerboards,
    });
    this.cpds = (props.cpds && new RangeSpec(props.cpds)) ?? this.cpds;
    this.contrasts =
      (props.contrasts && new RangeSpec(props.contrasts)) ?? this.contrasts;
  }

  baseStimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    const cpds = this.cpds?.list;
    const contrasts = this.contrasts?.list;
    for (let rep = 0; rep < this.nRepetitions; rep++) {
      for (const cpd of cpds) {
        for (const contrast of contrasts) {
          const stimSet: Stimulus[] = [];
          // Push pair of matching stimuli: one with inversion, one without
          const [fgColor, bgColor] = contrastPair(contrast);
          const stimPojo = {
            cpd: cpd,
            durationMs: this.bodyMs + this.tailMs,
            bodyMs: this.bodyMs,
            tailMs: this.tailMs,
            bgColor: bgColor,
            fgColor: fgColor,
            invertMs: this.bodyMs / 2, // Invert half way through body
            meta: { contrast: contrast },
          };
          stimSet.push(new Checkerboard(stimPojo)); // First stimulus
          // Second stimulus identical but with no inversion
          stimSet.push(
            new Checkerboard({
              ...stimPojo,
              invertMs: 0,
            })
          );
          stimuli.push(...stimSet);
        }
      }
    }
    return stimuli;
  }
}
