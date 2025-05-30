import { StimType, Stimulus } from './Stimulus';
import { colorToRGB, degreesToRadians, rgbToHex, vmax } from './stim-utils';

export enum GratingType {
  Sin = 'sin', // Sinusoidal
  Sqr = 'sqr', // Square
}
export class Grating extends Stimulus {
  gratingType: GratingType = GratingType.Sin;
  fgColor = 'white';
  speed: number = 10; // degrees per second TODO?: change to temporal frequency (Hz)?
  cpd: number = 10;
  angle = 45; // degrees
  constructor(props: Partial<Grating> = {}) {
    super({
      ...props,
      stimType:
        props.gratingType === GratingType.Sin
          ? StimType.SinGrating
          : StimType.SqrGrating,
    });
    this.gratingType = props.gratingType ?? this.gratingType;
    this.fgColor = props.fgColor ?? this.fgColor;
    this.speed = props.speed ?? this.speed;
    this.cpd = Math.abs(props.cpd ?? this.cpd);
    this.angle = props.angle ?? this.angle;
  }

  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    pxPerDegree: number,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.durationMs / 1000) {
      return;
    }
    const barWidthPx = this.cpd * pxPerDegree;
    if (barWidthPx < 0.5) {
      throw new Error(
        'cpd * pxPerDegree must be at least 0.5 to have at least one pixel' +
          ` cpd=${this.cpd} pxPerDegree=${pxPerDegree}`
      );
    }
    const angleRadians = degreesToRadians(this.angle);
    const vmax2 = 2 * vmax(ctx);

    const draw = (pxOffset: number): void => {
      const patternCanvas =
        this.gratingType === GratingType.Sin
          ? this.sinPatternCanvas(barWidthPx * 2, vmax2, pxOffset)
          : this.barPatternCanvas(barWidthPx * 2, vmax2, pxOffset);
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

    draw(Math.round(ageSeconds * this.speed * pxPerDegree));
  }

  barPatternCanvas(
    width: number, // fgColor is half the width
    height: number,
    offset: number
  ): OffscreenCanvas {
    offset = offset % width;
    const patternCanvas = new OffscreenCanvas(width, height);
    const ctx = patternCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    const fgWidth = Math.floor(width / 2); // Sightly favor bgColor

    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, width + fgWidth, height);

    ctx.fillStyle = this.fgColor;
    if (offset >= 0) {
      ctx.fillRect(offset, 0, fgWidth, height);
    } else {
      ctx.fillRect(0, 0, fgWidth + offset, height);
      ctx.fillRect(offset + width, 0, fgWidth, height);
    }
    if (offset > fgWidth) {
      ctx.fillRect(0, 0, offset - fgWidth, height);
    }

    return patternCanvas;
  }

  sinPatternCanvas(
    width: number, // Entire sine wave (over 360 degrees)
    height: number,
    offset: number
  ): OffscreenCanvas {
    offset = offset % width;
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
