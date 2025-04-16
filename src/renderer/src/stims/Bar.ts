import { StimTypeName, Stimulus } from './Stimulus';
import { degreesToRadians, diagonalLength, vminsToPx } from './stim-utils';

export class Bar extends Stimulus {
  // TODO: change parameters to match eye-candy
  fgColor: string = 'white';
  width: number = 10; // CSS vmin units (percent of display's smallest side)
  speed: number = 10; // vmins per second
  angle: number = 0; // Degrees

  constructor({
    duration,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Bar> = {}) {
    // console.log(`>>>>> constructor Bar(duration=${duration}, bgColor=${bgColor}, ...)`);
    super(StimTypeName.Bar, duration, bgColor);
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
    const diagonal = diagonalLength(ctx);
    const barWidth = vminsToPx(this.width, ctx);
    const draw = (x: number): void => {
      ctx.save();
      // Start with pure background
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Translate to canvas center to ensure rotation happens around the center.
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(degreesToRadians(this.angle));

      ctx.translate(x - ctx.canvas.width / 2, 0);
      ctx.fillStyle = this.fgColor;
      ctx.fillRect(-barWidth / 2, -diagonal / 2, barWidth, diagonal);
      ctx.restore();
    };

    draw(Math.round(ageSeconds * vminsToPx(this.speed, ctx)) % ctx.canvas.width);
  }
}
