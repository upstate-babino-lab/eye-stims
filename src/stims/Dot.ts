import { StimType, Stimulus } from './Stimulus';

export class Dot extends Stimulus {
  fgColor: string = 'white';
  d: number = 10; // Diameter in degrees
  x: number = 0; // Horizontal degrees of center from top left corner
  y: number = 0; // Vertical degrees of center from top left corner
  toX: number; // Horizontal degrees of center from top left corner at end of duration
  toY: number; // Vertical degrees of center from top left corner at end of duration

  constructor(props: Partial<Dot> = {}) {
    // console.log(`>>>>> constructor Dot(duration=${duration}, bgColor=${bgColor}, ...)`);
    super({ ...props, stimType: StimType.Dot });
    this.fgColor = props.fgColor ?? this.fgColor;
    this.d = props.d ?? this.d;
    this.x = props.x ?? this.x;
    this.y = props.y ?? this.y;
    this.toX = props.toX ?? this.x;
    this.toY = props.toY ?? this.y;
  }

  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    pxPerDegree: number,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.durationMs / 1000) {
      return;
    }
    const DotDiameterPx = this.d * pxPerDegree;

    const draw = (percent: number): void => {
      ctx.save();
      // Start with pure background
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const centerX = this.x + percent * (this.toX ? this.toX - this.x : 0);
      const centerY = this.y + percent * (this.toY ? this.toY - this.y : 0);

      ctx.beginPath();
      ctx.arc(
        centerX * pxPerDegree,
        centerY * pxPerDegree,
        DotDiameterPx / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = this.fgColor;
      ctx.fill();

      ctx.restore();
    };

    draw(ageSeconds / (this.durationMs / 1000));
  }
}
