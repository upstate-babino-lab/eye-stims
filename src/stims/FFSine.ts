import { linearToHex } from './stim-utils';
import { StimType, Stimulus } from './Stimulus';

// Full-Field Sine Wave Stimulus with specified contrast, mean luminance, frequency
export class FFSine extends Stimulus {
  c: number = 50; // Michelson contrast (max-min)/(max+min) range 0% to 100%
  m: number = 50; // Mean luminance with range 0 to 1/(1+c) (percent)
  hz: number = 1; // Cycles per second.  TODO: tune to frame rate
  delayMs: number = 0; // Delay by displaying mean before first frame
  private _min: number; // Min luminance, 0-1
  private _max: number; // Max luminance, 0-1

  constructor(props: Partial<FFSine> = {}) {
    // console.log(`>>>>> constructor FFSine(contrast=${props.contrast}, ...)`);
    super({ ...props, stimType: StimType.FFSine });

    this.c = props.c ?? this.c;
    if (this.c < 0) {
      this.c = 0;
    } else if (this.c > 100) {
      this.c = 100;
    }
    this.c = Math.round(this.c);
    const contrastF = this.c / 100;

    this.m = props.m ?? this.m;
    if (this.m < 0) {
      this.m = 0;
    } else if (this.m > 100) {
      this.m = 100;
    }
    const meanF = Math.min(this.m / 100, 1 / (1 + contrastF));
    this.m = Math.round(meanF * 100);

    this.hz = props.hz ?? this.hz;
    if (this.hz < 0) {
      this.hz = 0;
    }

    this.delayMs = props.delayMs ?? this.delayMs;
    if (this.delayMs < 0) {
      this.delayMs = 0;
    }

    this._min = meanF * (1 - contrastF);
    this._max = meanF * (1 + contrastF);
  }

  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    _pxPerDegree: number,
    ageSeconds: number
  ): void {
    const ageMs = ageSeconds * 1000;
    if (ageMs < 0 || ageMs > this.durationMs) {
      return;
    }
    const t = (ageMs - this.delayMs) / 1000; // Seconds after delay
    ctx.save();

    if (t < 0) {
      ctx.fillStyle = linearToHex(0, this.m / 100, 0);
    } else {
      // Calculate phase of the sine wave in radians.
      const angularFrequency = 2 * Math.PI * this.hz;
      const phase = angularFrequency * t;
      const rawSineValue = Math.sin(phase);

      const scaledValue =
        this.m / 100 + (rawSineValue * (this._max - this._min)) / 2;
      //console.log(`>>>>> rawSine=${rawSineValue} scaledValue=${scaledValue}`);
      ctx.fillStyle = linearToHex(0, scaledValue, 0);
    }

    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    return;
  }
}
