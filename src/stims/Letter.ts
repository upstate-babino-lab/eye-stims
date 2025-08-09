import { StimType, Stimulus } from './Stimulus';

export class Letter extends Stimulus {
  letter: string = 'C'; // Default letter
  fgColor: string = 'white';
  size: number = 10; // Degrees
  x: number = 0; // Horizontal degrees right from center
  y: number = 0; // Vertical degrees down from center
  toX: number; // Horizontal degrees right at duration
  toY: number; // Vertical degrees left at duration

  constructor(props: Partial<Letter> = {}) {
    // console.log(`>>>>> constructor Letter(duration=${duration}, bgColor=${bgColor}, ...)`);
    super({ ...props, stimType: StimType.Letter });
    this.letter = props.letter ?? this.letter;
    this.fgColor = props.fgColor ?? this.fgColor;
    this.size = props.size ?? this.size;
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
    const LetterDiameterPx = this.size * pxPerDegree;

    const draw = (percent: number): void => {
      ctx.save();
      // Start with pure background
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const centerX = this.x + percent * (this.toX ? this.toX - this.x : 0);
      const centerY = this.y + percent * (this.toY ? this.toY - this.y : 0);

      ctx.translate(
        ctx.canvas.width / 2 + centerX * pxPerDegree,
        ctx.canvas.height / 2 + centerY * pxPerDegree
      );

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.fgColor;
      ctx.font = LetterDiameterPx + 'px sloan-optotype';
      //ctx.font = LetterDiameterPx + 'px Arial';
      ctx.fillText(this.letter, 0, 0, LetterDiameterPx);

      ctx.restore();
    };

    draw(ageSeconds / (this.durationMs / 1000));
  }
}
