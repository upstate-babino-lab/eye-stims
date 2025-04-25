import { StimTypeName, Stimulus } from './Stimulus';

export class Solid extends Stimulus {
  constructor(props: Partial<Solid> = {}) {
    // console.log(`>>>>> constructor Solid(duration=${duration}, bgColor=${bgColor})`);
    super({ ...props, name: StimTypeName.Solid });
  }
  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void {
    const ageMs = ageSeconds * 1000;
    if (ageMs < 0 || ageMs > this.durationMs) {
      return;
    }
    if (ageMs < this.headMs!) {
      ctx.fillStyle = 'black';
    } else if (ageMs < this.headMs! + this.bodyMs!) {
      ctx.fillStyle = this.bgColor;
    } else {
      ctx.fillStyle = 'black';
    }
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
