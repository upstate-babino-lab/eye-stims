import { Stimulus } from '@stims/Stimulus';
import { RangeSpec } from './RangeSpec';
import { AssayType, Assay } from './Assay';
import { contrastPair } from '@stims/stim-utils';
import { Letter, STANDARD_SLOAN_LETTERS } from '@stims/Letter';

export class LettersAssay extends Assay {
  sizes: RangeSpec = new RangeSpec({ start: 5, step: 10, nSteps: 2 }); // Degrees
  contrasts: RangeSpec = new RangeSpec({
    start: 90,
    step: -10,
    nSteps: 4,
    min: 0,
    max: 100,
  });

  constructor(props: Partial<LettersAssay> = {}) {
    // TODO: Check that parameters are all in valid ranges
    super({
      ...props,
      assayType: AssayType.Letters,
    });
    this.sizes = (props.sizes && new RangeSpec(props.sizes)) ?? this.sizes;
    this.contrasts =
      (props.contrasts && new RangeSpec(props.contrasts)) ?? this.contrasts;
  }

  baseStimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    const sizes = this.sizes?.list;
    const contrasts = this.contrasts?.list;
    for (let rep = 0; rep < this.nRepetitions; rep++) {
      for (const size of sizes) {
        for (const contrast of contrasts) {
          const [fgColor, bgColor] = contrastPair(contrast);
          for (const letter of STANDARD_SLOAN_LETTERS) {
            stimuli.push(
              new Letter({
                letter: letter,
                size: size,
                durationMs: this.bodyMs + this.tailMs,
                bodyMs: this.bodyMs,
                tailMs: this.tailMs,
                bgColor: bgColor,
                fgColor: fgColor,
                meta: { contrast: contrast },
              })
            );
          }
        }
      }
    }
    return stimuli;
  }
}
