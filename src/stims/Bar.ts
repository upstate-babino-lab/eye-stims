import { StimType, Stimulus } from './Stimulus';
import { degreesToRadians, diagonalLength } from './stim-utils';

export class Bar extends Stimulus {
  fgColor: string = 'white';
  width: number = 10; // Degrees
  speed: number = 10; // Degrees per second
  angle: number = 0; // Degrees

  constructor(props: Partial<Bar> = {}) {
    // console.log(`>>>>> constructor Bar(duration=${duration}, bgColor=${bgColor}, ...)`);
    super({ ...props, stimType: StimType.Bar });
    this.fgColor = props.fgColor ?? this.fgColor;
    this.speed = props.speed ?? this.speed;
    this.width = props.width ?? this.width;
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
    const barWidthPx = this.width * pxPerDegree;
    const diagonal = diagonalLength(ctx) + barWidthPx / 2;
    const barLength = diagonal * 2; // Extra to be sure it's long enough
    const angleRadians = degreesToRadians(this.angle);

    const draw = (pxOffset: number): void => {
      ctx.save();
      // Start with pure background
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2); // Origin to center
      ctx.rotate(angleRadians); // Rotate around origin

      // Offset is perpendicular to the bar angle
      pxOffset = pxOffset - diagonal / 2; // So bar starts just off screen
      const offsetX = pxOffset * Math.sin(angleRadians);
      const offsetY = -pxOffset * Math.cos(angleRadians);
      ctx.translate(offsetX, offsetY);

      ctx.fillStyle = this.fgColor;
      // Rectangle centered on origin
      ctx.fillRect(-barLength / 2, -barWidthPx / 2, barLength, barWidthPx);

      ctx.restore();
    };

    draw(Math.round(ageSeconds * this.speed * pxPerDegree) % (diagonal * 1.1));
  }
}
