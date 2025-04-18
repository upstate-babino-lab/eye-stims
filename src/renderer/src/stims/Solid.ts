import { StimTypeName, Stimulus } from './Stimulus';

export class Solid extends Stimulus {
  constructor({ duration, bgColor, meta }: Partial<Solid> = {}) {
    // console.log(`>>>>> constructor Solid(duration=${duration}, bgColor=${bgColor})`);
    super(StimTypeName.Solid, duration, bgColor, meta);
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
  }
}
