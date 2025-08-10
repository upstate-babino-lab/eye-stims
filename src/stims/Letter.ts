import { StimType, Stimulus } from './Stimulus';

export const STANDARD_SLOAN_LETTERS = [
  'C',
  'D',
  'H',
  'K',
  'N',
  'O',
  'R',
  'S',
  'V',
  'Z',
  ' ',
];

export class Letter extends Stimulus {
  letter: string = STANDARD_SLOAN_LETTERS[0];
  fgColor: string = 'white';
  size: number = 10; // Degrees

  constructor(props: Partial<Letter> = {}) {
    // console.log(`>>>>> constructor Letter(duration=${duration}, bgColor=${bgColor}, ...)`);
    super({ ...props, stimType: StimType.Letter });
    this.letter = props.letter ?? this.letter;
    this.fgColor = props.fgColor ?? this.fgColor;
    this.size = props.size ?? this.size;
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

    ctx.save();
    // Start with pure background
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.fgColor;
    ctx.font = LetterDiameterPx + 'px sloan-optotype'; // From assets/main.css
    ctx.fillText(this.letter, 0, 0);

    ctx.restore();
  }
}
