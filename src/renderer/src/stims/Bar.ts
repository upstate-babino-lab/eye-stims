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
    const barWidth = vminsToPx(this.width, ctx);
    const diagonal = diagonalLength(ctx) + barWidth / 2;
    const barLength = diagonal * 2; // Extra to be sure it's long enough
    const angleRadians = degreesToRadians(this.angle);

    const draw = (offset: number): void => {
      ctx.save();
      // Start with pure background
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(angleRadians);

      // Offset is perpendicular to the bar angle
      // TODO: offset should be in direction of vmin
      offset = offset - diagonal / 2; // So bar starts just off screen
      const offsetX = offset * Math.sin(angleRadians);
      const offsetY = -offset * Math.cos(angleRadians);
      ctx.translate(offsetX, offsetY);

      ctx.fillStyle = this.fgColor;
      //ctx.fillRect(-barWidth / 2, -diagonal, barWidth, diagonal);
      ctx.fillRect(-barLength / 2, -barWidth / 2, barLength, barWidth);

      ctx.restore();
    };

    draw(Math.round(ageSeconds * vminsToPx(this.speed, ctx)) % (diagonal * 1.1));
  }
}
