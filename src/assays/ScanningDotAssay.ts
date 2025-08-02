import { RangeSpec } from './RangeSpec';
import { AssayType, Assay } from './Assay';
import { Dot, Stimulus } from '@stims/index';
import { displays } from '../displays';
// TODO: used last selected display
export const maxXDegrees = Math.round(
  displays.SD1.width / displays.SD1.pxPerDegree
);
export const maxYDegrees = Math.round(
  displays.SD1.height / displays.SD1.pxPerDegree
);

export class ScanningDotAssay extends Assay {
  diameters: RangeSpec = new RangeSpec({ start: 3, step: 3, nSteps: 1 });
  xDegrees: RangeSpec = new RangeSpec({
    start: 3,
    step: Math.floor(maxXDegrees / 10),
    nSteps: 10,
  });
  yDegrees: RangeSpec = new RangeSpec({
    start: 4,
    step: Math.floor(maxYDegrees / 10),
    nSteps: 10,
  });

  constructor(props: Partial<ScanningDotAssay> = {}) {
    // TODO: Check that cpds, contrasts, and speeds are all in valid ranges
    super({
      ...props,
      assayType: AssayType.ScanningDot,
    });
    this.diameters =
      (props.diameters && new RangeSpec(props.diameters)) ?? this.diameters;
    this.xDegrees =
      (props.xDegrees && new RangeSpec(props.xDegrees)) ?? this.xDegrees;
    this.yDegrees =
      (props.yDegrees && new RangeSpec(props.yDegrees)) ?? this.yDegrees;
  }

  baseStimuli(): Stimulus[] {
    const stimuli: Stimulus[] = [];
    const diameters = this.diameters?.list;
    const xDegrees = this.xDegrees?.list;
    const yDegrees = this.yDegrees?.list;
    for (let rep = 0; rep < this.nRepetitions; rep++) {
      for (const diameter of diameters) {
        for (const yDegree of yDegrees) {
          for (const xDegree of xDegrees) {
            const dotPojo = {
              durationMs: this.bodyMs + this.tailMs,
              bodyMs: this.bodyMs,
              tailMs: this.tailMs,
              bgColor: 'black',
              fgColor: 'white',
              d: diameter,
              x: xDegree,
              y: yDegree,
            };
            stimuli.push(new Dot(dotPojo));
          }
        }
      }
    }
    return stimuli;
  }
}
