import { StimTypeName, Stimulus } from './Stimulus';
import { degreesToRadians, diagonalLength } from './stim-utils';

export class SinusoidalGrating extends Stimulus {
  width: number = 10; // vmins: percent of minimum viewport dimension
  speed: number = 10; // vmins per second
  angle = 45; // degrees
  barColor = 'white';
  constructor({ duration, bgColor }: Partial<SinusoidalGrating> = {}) {
    super(StimTypeName.SinusoidalGrating, duration, bgColor);
  }
  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.duration) {
      return;
    }
    const draw = (x: number): void => {
      ctx.save();
      ctx.fillStyle = this.barColor;
      // move to the center of the canvas
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(-degreesToRadians(this.angle));
      const diag = diagonalLength(ctx);
      ctx.translate(-diag / 2, -diag / 2);
      ctx.translate(x, 0);
      ctx.fillRect(-ctx.canvas.width * 2, 0, diag + ctx.canvas.width * 2, diag);
      ctx.restore();
    };

    draw(Math.round(ageSeconds * this.speed) % ctx.canvas.width);
  }
}
