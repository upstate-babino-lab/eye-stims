export enum StimTypeName {
  Solid = 'Solid',
  Bar = 'Bar',
}

export abstract class Stimulus {
  name: StimTypeName;
  duration: number = 1; // Seconds
  bgColor: string = 'black';

  constructor(name: StimTypeName, duration?: number, bgColor?: string) {
    this.name = name;
    this.duration = duration ?? this.duration;
    this.bgColor = bgColor ?? this.bgColor;
  }

  render(canvas: HTMLCanvasElement | OffscreenCanvas, onDone?: () => void): void {
    if (canvas instanceof OffscreenCanvas) {
      // Offscreen
    } else {
      // Onscreen animation (for preview only)
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('render() got invalid context from canvas');
      }
      let lastTimestamp = 0;
      const animate = (newTimestamp: number): void => {
        if (!lastTimestamp) {
          lastTimestamp = newTimestamp;
        }
        const age = (newTimestamp - lastTimestamp) / 1000; // Seconds
        if (age < this.duration) {
          this.renderFrame(ctx, age);
          requestAnimationFrame(animate);
        } else {
          if (onDone) {
            onDone();
          }
        }
      };
      requestAnimationFrame(animate);
    }
  }

  abstract renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void;
}

export class Solid extends Stimulus {
  constructor({ duration, bgColor }: Partial<Solid> = {}) {
    super(StimTypeName.Solid, duration, bgColor);
  }
  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ageSeconds: number
  ): void {
    if (ageSeconds <= this.duration) {
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
}

export class Bar extends Stimulus {
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
    if (ageSeconds > this.duration) {
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

      // Move to desired location before drawing
      ctx.translate(x - ctx.canvas.width / 2, 0);
      ctx.fillStyle = this.fgColor;
      ctx.fillRect(-this.width / 2, -diagonal / 2, this.width, diagonal);
      ctx.restore();
    };

    const barX = Math.round(ageSeconds * this.speed) % ctx.canvas.width;
    drawBar(barX);
  }
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Map of constructors allowing lookup by name
export const stimConstructors = {
  Solid: Solid,
  Bar: Bar,
};
