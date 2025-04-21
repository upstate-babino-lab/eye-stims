import { StimTypeName, Stimulus } from './Stimulus';
import {
  colorToRGB,
  degreesToRadians,
  rgbToHex,
  vmax,
  vminsToPx,
} from './stim-utils';

export enum GratingType {
  Sin = 'sin', // Sinusoidal
  Sqr = 'sqr', // Square
}
export class Grating extends Stimulus {
  gratingType: GratingType = GratingType.Sin;
  fgColor = 'white';
  speed: number = 10; // vmins per second // TODO: change to degrees per second
  width: number = 10; // vmins: percent of minimum viewport dimension // TODO: change to degrees
  angle = 45; // degrees
  constructor({
    gratingType,
    duration,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Grating> = {}) {
    super(
      gratingType === GratingType.Sin
        ? StimTypeName.SinGrating
        : StimTypeName.SqrGrating,
      duration,
      bgColor
    );
    this.gratingType = gratingType ?? this.gratingType;
    this.fgColor = fgColor ?? this.fgColor;
    this.speed = speed ?? this.speed;
    this.width = width ?? this.width;
    this.angle = angle ?? this.angle;
  }
  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.duration) {
      return;
    }
    const barWidth = vminsToPx(this.width, ctx);
    const angleRadians = degreesToRadians(this.angle);
    const vmax2 = 2 * vmax(ctx);

    const draw = (pxOffset: number): void => {
      const patternCanvas =
        this.gratingType === GratingType.Sin
          ? this.sinPatternCanvas(barWidth, vmax2, pxOffset % barWidth)
          : this.barPatternCanvas(barWidth, vmax2, pxOffset % barWidth);
      ctx.save();
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      if (!pattern) {
        throw new Error('Could not create pattern');
      }
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2); // Origin to center
      ctx.rotate(angleRadians); // Rotate around origin
      ctx.fillStyle = pattern;
      ctx.fillRect(-vmax2 / 2, -vmax2 / 2, vmax2, vmax2);
      ctx.restore();
    };

    draw(Math.round(ageSeconds * vminsToPx(this.speed, ctx)));
  }

  barPatternCanvas(
    width: number,
    height: number,
    offset: number
  ): OffscreenCanvas {
    const patternCanvas = new OffscreenCanvas(width, height);
    const ctx = patternCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    const fgWidth = Math.floor(width / 2); // Sightly favor bgColor
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = this.fgColor;
    ctx.fillRect(offset, 0, fgWidth, height); // May overflow off the right edge
    ctx.fillRect(offset - width, 0, fgWidth, height); // May start before the left edge
    return patternCanvas;
  }

  sinPatternCanvas(
    width: number,
    height: number,
    offset: number
  ): OffscreenCanvas {
    const patternCanvas = new OffscreenCanvas(width, height);
    const ctx = patternCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    const fgColor = colorToRGB(this.fgColor);
    const bgColor = colorToRGB(this.bgColor);

    for (let x = 0; x < width; x++) {
      const scaledX = (x / width) * Math.PI * 2;
      const scaledOffset = ((offset % width) / width) * Math.PI * 2;
      // Subtract offset to reverse direction. Normalize to [0, 1]
      const fraction = (Math.sin(scaledX - scaledOffset) + 1) / 2;
      const rgb = {
        r: Math.round(fgColor.r * (1 - fraction) + bgColor.r * fraction),
        g: Math.round(fgColor.g * (1 - fraction) + bgColor.g * fraction),
        b: Math.round(fgColor.b * (1 - fraction) + bgColor.b * fraction),
      };

      ctx.fillStyle = rgbToHex(rgb);
      ctx.fillRect(x, 0, x + 1, height);
    }

    return patternCanvas;
  }
}
