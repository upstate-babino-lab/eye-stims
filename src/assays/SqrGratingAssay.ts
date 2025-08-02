import { Stimulus } from '@stims/Stimulus';
import { RangeSpec } from './RangeSpec';
import { AssayType, Assay } from './Assay';
import { contrastPair, linearToHex } from '@stims/stim-utils';
import { SqrGrating } from '@stims/SqrGrating';
import { Solid } from '@stims/Solid';

export class SqrGratingAssay extends Assay {
  cpds: RangeSpec = new RangeSpec({ start: 0.3, step: 0.2, nSteps: 1 }); // TODO? add min/max
  contrasts: RangeSpec = new RangeSpec({
    start: 90,
    step: -10,
    nSteps: 4,
    min: 0,
    max: 100,
  });
  speeds: RangeSpec = new RangeSpec({ start: 3, step: 1, nSteps: 1 }); // TODO? add min/max
  includeStaticGratings: boolean = false;

  constructor(props: Partial<SqrGratingAssay> = {}) {
    // TODO: Check that cpds, contrasts, and speeds are all in valid ranges
    super({
      ...props,
      assayType: AssayType.SqrGratingPairs,
    });
    this.cpds = (props.cpds && new RangeSpec(props.cpds)) ?? this.cpds;
    this.contrasts =
      (props.contrasts && new RangeSpec(props.contrasts)) ?? this.contrasts;
    this.speeds = (props.speeds && new RangeSpec(props.speeds)) ?? this.speeds;
    this.includeStaticGratings =
      props.includeStaticGratings ?? this.includeStaticGratings;
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
            const stimSet: Stimulus[] = [];
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
              stimuli.push(...stimSet);
            } else {
              const grayStim = new Solid({
                durationMs: this.grayMs + this.grayTailMs,
                bodyMs: this.grayMs,
                tailMs: this.grayTailMs,
                bgColor: linearToHex(0.5, 0.5, 0.5), // Gray
              });
              // Add gray stimulus after each grating
              stimSet.forEach((stim) => {
                stimuli.push(stim);
                stimuli.push(grayStim);
              });
            }
          }
        }
      }
    }
    return stimuli;
  }
}
