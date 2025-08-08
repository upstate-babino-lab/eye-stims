import { assert } from '../shared-utils';
import { StimType, Stimulus } from './Stimulus';
import { degreesToRadians, vmax } from './stim-utils';

export class Checkerboard extends Stimulus {
  fgColor: string = 'white';
  cpd: number = 0.1;
  inversionOffsetMs: number = 0; // How far into body to start inverting
  angle: number = 0; // Degrees

  constructor(props: Partial<Checkerboard> = {}) {
    // console.log(`>>>>> constructor Checkerboard(duration=${duration}, bgColor=${bgColor}, ...)`);
    super({ ...props, stimType: StimType.Checkerboard });
    this.fgColor = props.fgColor ?? this.fgColor;
    this.inversionOffsetMs = props.inversionOffsetMs ?? this.inversionOffsetMs;
    this.cpd = props.cpd ?? this.cpd;
    this.angle = props.angle ?? this.angle;

    const bodyDuration =
      this.durationMs - ((this.headMs ?? 0) + (this.tailMs ?? 0));
    assert(
      this.inversionOffsetMs < bodyDuration,
      'inversionOffsetMs must be less than body duration'
    );
  }

  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    pxPerDegree: number,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.durationMs / 1000) {
      return;
    }
    const angleRadians = degreesToRadians(this.angle);
    const vmax1 = vmax(ctx);
    const vmax2 = vmax1 * 2;

    const squareWidthPx = this.cpd > 0 ? pxPerDegree / (this.cpd * 2) : vmax1;
    if (squareWidthPx < 0.5) {
      throw new Error(
        'cpd * pxPerDegree must be at least 0.5 to have at least one pixel' +
          ` cpd=${this.cpd} pxPerDegree=${pxPerDegree}`
      );
    }

    const draw = (doInverted: boolean): void => {
      const patternCanvas = this.patternCanvas(squareWidthPx * 2, doInverted);
      ctx.save();
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      if (!pattern) {
        throw new Error('Could not create pattern');
      }
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2); // Origin to center
      ctx.rotate(angleRadians); // Rotate around origin
      ctx.fillStyle = pattern;
      ctx.fillRect(-vmax1, -vmax1, vmax2, vmax2);
      ctx.restore();
    };

    draw(
      !!this.inversionOffsetMs &&
        ageSeconds * 1000 >= (this.headMs ?? 0) + this.inversionOffsetMs
    );
  }

  patternCanvas(
    edgeSize: number, // Squares are half
    doInverted: boolean
  ): OffscreenCanvas {
    const patternCanvas = new OffscreenCanvas(edgeSize, edgeSize);
    const ctx = patternCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    const sqSize = Math.floor(edgeSize / 2);

    ctx.fillStyle = doInverted ? this.fgColor : this.bgColor;
    ctx.fillRect(0, 0, edgeSize, edgeSize);

    ctx.fillStyle = doInverted ? this.bgColor : this.fgColor;
    ctx.fillRect(0, 0, sqSize, sqSize);
    ctx.fillRect(sqSize, sqSize, sqSize, sqSize);

    return patternCanvas;
  }
}
