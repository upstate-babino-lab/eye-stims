import { SqrGrating } from './SqrGrating';
import { StimTypeName, Stimulus, Solid, Bar, SinGrating } from './index';

// Should never actually be used.
class Uninitialized extends Stimulus {
  constructor(props: Partial<Uninitialized> = {}) {
    super({ ...props, name: StimTypeName.Uninitialized });
  }
  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    _pxPerDegree: number,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.durationMs / 1000) {
      return;
    }
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center'; // Horizontal centering
    ctx.textBaseline = 'middle'; // Vertical centering
    ctx.fillText(
      'Uninitialized Stimulus',
      ctx.canvas.width / 2,
      ctx.canvas.height / 2
    );
  }
}

// Map of constructors that create new Stimulus class objects (with methods)
// from simple parsed JSON objects (with no methods) using lookup by name.
// Each StimTypeName must be assigned or thankfully, Typescript complains.
type StimConstructors = {
  [key in StimTypeName]: new (args: Partial<Stimulus>) => Stimulus;
};
export const stimConstructors: StimConstructors = {
  Uninitialized: Uninitialized,
  Solid: Solid,
  Bar: Bar,
  SinGrating: SinGrating,
  SqrGrating: SqrGrating,
};

// Create a new Stimulus class instance from POJO or parsed JSON object.
export function newStimulus(stim: Stimulus) {
  const isValidStimType = stim && Object.values(StimTypeName).includes(stim.name);
  let constructor = stimConstructors['Uninitialized'];
  if (isValidStimType) {
    constructor = stimConstructors[stim.name];
    if (!constructor) {
      console.log(
        `ERROR from newStimulus(): '${stim?.name}' not found in stimConstructors.`
      );
      console.log(`"import ${stim.name}" is missing`);
      throw new Error(`Stimulus '${stim.name}' not found`);
    }
  } else {
    console.log(`ERROR from newStimulus(): '${stim?.name}' invalid StimTypeName`);
  }
  return new constructor(stim);
}
