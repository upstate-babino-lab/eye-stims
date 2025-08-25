import { StimType, Stimulus } from './Stimulus';

export class Solid extends Stimulus {
  text: string = '';
  constructor(props: Partial<Solid> = {}) {
    // console.log(`>>>>> constructor Solid(duration=${duration}, bgColor=${bgColor})`);
    super({ ...props, stimType: StimType.Solid });
    this.text = props.text ?? this.text;
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
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (this.text) {
      ctx.font = '20px Arial';
      ctx.fillStyle = 'red'; // Less visible to mouse retina
      ctx.textAlign = 'center'; // Horizontal centering
      ctx.textBaseline = 'middle'; // Vertical centering
      ctx.fillText(this.text, ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
  }
}
