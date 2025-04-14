import { StimTypeName, Stimulus } from './Stimulus';

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default class Bar extends Stimulus {
  // TODO: change parameters to match eye-candy
  fgColor: string = 'white';
  speed: number = 100; // pixels per second
  width: number = 100; // pixels
  angle: number = 0; // degrees

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
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const diagonal = Math.sqrt(
      ctx.canvas.width * ctx.canvas.width + ctx.canvas.height * ctx.canvas.height
    );
    const drawBar = (x: number): void => {
      ctx.save();
      // Start with pure background
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Translate to canvas center to ensure rotation happens around the center.
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(degreesToRadians(this.angle));

      ctx.translate(x - ctx.canvas.width / 2, 0);
      ctx.fillStyle = this.fgColor;
      ctx.fillRect(-this.width / 2, -diagonal / 2, this.width, diagonal);
      ctx.restore();
    };

    const barX = Math.round(ageSeconds * this.speed) % ctx.canvas.width;
    drawBar(barX);
  }
}
